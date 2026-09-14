from __future__ import annotations
import json, sqlite3, time, shutil, uuid
from pathlib import Path
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from media_engine import ingest, captions_to_srt, preflight, render
ROOT=Path(__file__).resolve().parent; DB=ROOT/'creator_os.db'; MEDIA=ROOT/'media'; OUT=ROOT/'renders'; MEDIA.mkdir(exist_ok=True); OUT.mkdir(exist_ok=True)
def db(): c=sqlite3.connect(DB); c.row_factory=sqlite3.Row; return c
def init():
 c=db(); c.executescript('CREATE TABLE IF NOT EXISTS media_assets(id TEXT PRIMARY KEY,data TEXT NOT NULL,created_at REAL NOT NULL); CREATE TABLE IF NOT EXISTS timelines(id TEXT PRIMARY KEY,data TEXT NOT NULL,created_at REAL NOT NULL); CREATE TABLE IF NOT EXISTS captions(id TEXT PRIMARY KEY,data TEXT NOT NULL,created_at REAL NOT NULL); CREATE TABLE IF NOT EXISTS render_jobs(id TEXT PRIMARY KEY,data TEXT NOT NULL,created_at REAL NOT NULL);'); c.commit(); c.close()
def save(table,id,data):
 c=db(); c.execute(f'INSERT OR REPLACE INTO {table}(id,data,created_at) VALUES(?,?,?)',(id,json.dumps(data),time.time())); c.commit(); c.close()
def rows(table):
 c=db(); r=[json.loads(x['data']) for x in c.execute(f'SELECT data FROM {table} ORDER BY created_at DESC')]; c.close(); return r
class H(BaseHTTPRequestHandler):
 def j(self,obj,status=200):
  b=json.dumps(obj,ensure_ascii=False,indent=2).encode(); self.send_response(status); self.send_header('Content-Type','application/json'); self.send_header('Content-Length',str(len(b))); self.end_headers(); self.wfile.write(b)
 def body(self): return json.loads(self.rfile.read(int(self.headers.get('Content-Length','0'))) or '{}')
 def do_GET(self):
  if self.path=='/api/health': return self.j({'ok':True,'build':'05','ffmpeg':shutil.which('ffmpeg') is not None})
  if self.path=='/api/media': return self.j(rows('media_assets'))
  if self.path=='/api/timelines': return self.j(rows('timelines'))
  if self.path=='/api/captions': return self.j(rows('captions'))
  return self.j({'error':'not_found'},404)
 def do_POST(self):
  try:
   p=self.path; d=self.body()
   if p=='/api/media/ingest':
    a=ingest(d['path'],MEDIA,d.get('provenance','creator_original'),d.get('rights_status','approved'),d.get('source_url'),d.get('claim_ids')); save('media_assets',a['asset_id'],a); return self.j(a)
   if p=='/api/captions':
    cid='cap_'+uuid.uuid4().hex[:12]; out=ROOT/'captions'; out.mkdir(exist_ok=True); fn=out/f'{cid}.srt'; fn.write_text(captions_to_srt(d['captions']),encoding='utf-8'); obj={'caption_id':cid,'format':'srt','path':str(fn),'captions':d['captions']}; save('captions',cid,obj); return self.j(obj)
   if p=='/api/timeline':
    tid='tl_'+uuid.uuid4().hex[:12]; tl={'timeline_id':tid,'version':1,'fps':d.get('fps',30),'width':d.get('width',1920),'height':d.get('height',1080),'items':d['items']}; save('timelines',tid,tl); return self.j(tl)
   if p=='/api/preflight': return self.j(preflight(d['timeline'],d['assets'],d.get('captions'),d.get('output')))
   if p=='/api/render':
    m=render(d['timeline'],d['assets'],d.get('output',str(OUT/'master.mp4')),bool(d.get('dry_run',False))); save('render_jobs',m['render_id'],m); return self.j(m,200 if m['status'] not in {'blocked','failed'} else 409)
   return self.j({'error':'not_found'},404)
  except Exception as e: return self.j({'error':str(e)},400)
 def log_message(self,*args): pass
if __name__=='__main__': init(); print('Creator OS Build 05 → http://127.0.0.1:8765'); ThreadingHTTPServer(('127.0.0.1',8765),H).serve_forever()
