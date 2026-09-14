from __future__ import annotations
import hashlib, json, mimetypes, os, shutil, subprocess, uuid
from pathlib import Path

VIDEO_EXT={'.mp4','.mov','.mkv','.webm','.m4v','.avi'}
AUDIO_EXT={'.mp3','.wav','.m4a','.aac','.flac','.ogg'}
IMAGE_EXT={'.png','.jpg','.jpeg','.webp'}

def uid(prefix='id'): return f"{prefix}_{uuid.uuid4().hex[:12]}"
def sha256_file(path: Path, chunk=1024*1024):
    h=hashlib.sha256()
    with path.open('rb') as f:
        while b:=f.read(chunk): h.update(b)
    return h.hexdigest()
def ffprobe(path: Path):
    p=subprocess.run(['ffprobe','-v','error','-show_format','-show_streams','-of','json',str(path)],capture_output=True,text=True)
    if p.returncode: raise RuntimeError(p.stderr.strip() or 'ffprobe failed')
    return json.loads(p.stdout)
def probe_summary(path: Path):
    data=ffprobe(path); fmt=data.get('format',{}); streams=data.get('streams',[])
    return {'duration':float(fmt.get('duration',0) or 0),'format':fmt.get('format_name'),'size':int(fmt.get('size',0) or 0), 'streams':[{'index':s.get('index'),'codec_type':s.get('codec_type'),'codec_name':s.get('codec_name'),'width':s.get('width'),'height':s.get('height'),'sample_rate':s.get('sample_rate'),'channels':s.get('channels'),'fps':s.get('r_frame_rate')} for s in streams]}
def ingest(path, asset_root, provenance='creator_original', rights_status='approved', source_url=None, claim_ids=None):
    src=Path(path).expanduser().resolve(); root=Path(asset_root); root.mkdir(parents=True,exist_ok=True)
    if not src.exists() or not src.is_file(): raise FileNotFoundError(src)
    ext=src.suffix.lower(); kind='video' if ext in VIDEO_EXT else 'audio' if ext in AUDIO_EXT else 'image' if ext in IMAGE_EXT else 'file'
    digest=sha256_file(src); dest=root/f'{digest[:16]}{ext}'
    if not dest.exists(): shutil.copy2(src,dest)
    return {'asset_id':uid('asset'),'path':str(dest),'original_name':src.name,'sha256':digest,'kind':kind,'mime':mimetypes.guess_type(src.name)[0], 'provenance':provenance,'rights_status':rights_status,'source_url':source_url,'claim_ids':claim_ids or [],'probe':probe_summary(dest) if kind in {'video','audio'} else {}}
def srt_timestamp(seconds):
    ms=max(0,int(round(seconds*1000))); h,ms=divmod(ms,3600000); m,ms=divmod(ms,60000); s,ms=divmod(ms,1000)
    return f'{h:02}:{m:02}:{s:02},{ms:03}'
def captions_to_srt(captions):
    lines=[]
    for i,c in enumerate(captions,1): lines += [str(i),f"{srt_timestamp(c['start'])} --> {srt_timestamp(c['end'])}",c['text'].strip(),'']
    return '\n'.join(lines)
def preflight(timeline, assets, captions=None, output=None):
    issues=[]; ids={a['asset_id'] for a in assets}; seen=set()
    for item in timeline.get('items',[]):
        aid=item.get('asset_id')
        if aid not in ids: issues.append(f'unknown_asset:{aid}')
        if item.get('end',0)<=item.get('start',0): issues.append(f'invalid_timing:{item.get("item_id")}')
        if aid in seen and item.get('allow_reuse') is not True: issues.append(f'unexpected_reuse:{aid}')
        seen.add(aid)
    for a in assets:
        if a.get('rights_status')!='approved': issues.append(f'rights_not_approved:{a["asset_id"]}')
    if captions:
        for c in captions:
            if not c.get('text','').strip() or c['end']<=c['start']: issues.append('invalid_caption')
    if not timeline.get('items'): issues.append('empty_timeline')
    return {'ok':not issues,'issues':issues,'asset_count':len(assets),'timeline_items':len(timeline.get('items',[])),'output':output}
def build_ffmpeg_command(timeline, assets, output, width=1920,height=1080,fps=30):
    by={a['asset_id']:a for a in assets}; inputs=[]; filters=[]; labels=[]
    for i,item in enumerate(timeline['items']):
        a=by[item['asset_id']]; typ=a['kind']
        if typ=='image': inputs += ['-loop','1','-i',a['path']]
        else: inputs += ['-i',a['path']]
        dur=float(item['end'])-float(item['start'])
        if typ=='image': filters.append(f'[{i}:v]scale={width}:{height}:force_original_aspect_ratio=decrease,pad={width}:{height}:(ow-iw)/2:(oh-ih)/2,setsar=1,fps={fps},trim=duration={dur},setpts=PTS-STARTPTS[v{i}]')
        elif typ=='video': filters.append(f'[{i}:v]scale={width}:{height}:force_original_aspect_ratio=decrease,pad={width}:{height}:(ow-iw)/2:(oh-ih)/2,setsar=1,fps={fps},trim=start={item.get("in",0)}:duration={dur},setpts=PTS-STARTPTS[v{i}]')
        else: continue
        labels.append(f'[v{i}]')
    if not labels: raise ValueError('timeline has no visual assets')
    filters.append(''.join(labels)+f'concat=n={len(labels)}:v=1:a=0[outv]')
    return ['ffmpeg','-y',*inputs,'-filter_complex',';'.join(filters),'-map','[outv]','-an','-c:v','libx264','-pix_fmt','yuv420p','-movflags','+faststart',output]
def render(timeline, assets, output, dry_run=False):
    pf=preflight(timeline,assets,output=output); manifest={'render_id':uid('render'),'status':'blocked' if not pf['ok'] else 'planned','preflight':pf,'output':str(output)}
    if not pf['ok'] or dry_run: return manifest
    cmd=build_ffmpeg_command(timeline,assets,output); p=subprocess.run(cmd,capture_output=True,text=True)
    manifest['command']=cmd; manifest['returncode']=p.returncode; manifest['status']='rendered' if p.returncode==0 else 'failed'; manifest['stderr_tail']=p.stderr[-3000:]
    if p.returncode==0: manifest['output_probe']=probe_summary(Path(output))
    return manifest
