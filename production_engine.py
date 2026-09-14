"""Creator OS Build 04 — Production Intelligence.
Turns an approved narrative package into evidence-linked script segments,
voice direction, visual asset requirements and deterministic production QA.
No third-party dependencies.
"""
import re, hashlib, datetime

def uid(text): return hashlib.sha256(text.encode('utf-8')).hexdigest()[:16]
def sentence_split(text): return [s.strip() for s in re.split(r'(?<=[.!?।])\s+', text or '') if s.strip()]
def script_blueprint(topic,narrative,claims):
    angle=narrative.get('selected_angle',{}); hooks=narrative.get('hooks',[])
    strong=[c for c in claims if c.get('evidence_strength',0)>=70 and not c.get('verification_required')]
    review=[c for c in claims if c.get('verification_required')]
    sections=[{'id':'S1','role':'hook','draft':hooks[0] if hooks else f'Everyone knows the headline of {topic}. The real story starts before it.','claim_ids':[],'citation_required':False}, {'id':'S2','role':'question','draft':f'The question this film investigates is simple: what actually drove the outcome of {topic}?','claim_ids':[],'citation_required':False}]
    for i,c in enumerate(strong[:8],1): sections.append({'id':f'S{2+i}','role':'evidence','draft':c.get('claim',''),'claim_ids':[c.get('id')],'citation_required':True})
    if review: sections.append({'id':f'S{len(sections)+1}','role':'uncertainty','draft':'Some parts of the record remain disputed or insufficiently documented. Those points stay marked for review rather than being presented as settled fact.','claim_ids':[c.get('id') for c in review[:5]],'citation_required':True})
    sections.append({'id':f'S{len(sections)+1}','role':'synthesis','draft':angle.get('thesis',f'The strongest explanation for {topic} is found in the evidence, constraints and decisions surrounding it.'),'claim_ids':[],'citation_required':False})
    return sections

def run_qa(sentences,claims,visuals):
    ids={str(c.get('id')) for c in claims};mapped=True;unsupported=[];duplicate=[];seen=set();rights=True
    for s in sentences:
        for cid in s.get('claim_ids',[]):
            if cid is None or str(cid) not in ids: mapped=False;unsupported.append(s['id'])
        key=re.sub(r'\W+',' ',s['text'].lower()).strip()
        if key in seen: duplicate.append(s['id'])
        seen.add(key)
    for v in visuals:
        if v.get('rights')!='creator_original' and v.get('rights_status')!='approved': rights=False
    return {'sentence_claim_mapping':mapped,'no_unmapped_claim_ids':not unsupported,'duplicate_sentence_check':not duplicate,'visual_rights_review':rights,'unsupported_sentence_ids':unsupported,'duplicate_sentence_ids':duplicate,'publish_ready':mapped and not unsupported and not duplicate and rights}

def build_production_package(topic,narrative,claims,style='documentary'):
    sections=script_blueprint(topic,narrative,claims);sentences=[]
    for sec in sections:
        for s in sentence_split(sec['draft']): sentences.append({'id':'ST-'+uid(sec['id']+s),'section_id':sec['id'],'text':s,'claim_ids':sec['claim_ids'],'citation_required':sec['citation_required'],'citation_status':'mapped' if sec['claim_ids'] else 'not_required'})
    visual=[]
    for i,sec in enumerate(sections,1):
        original=sec['role'] in ('question','synthesis')
        visual.append({'id':f'V{i:02d}','section_id':sec['id'],'type':'original_diagram' if original else 'source_visual','description':'Original explanatory graphic' if original else 'Use only a licensed, public-domain, user-owned or properly attributed source visual.','provenance':'creator_original' if original else 'external_source','rights':'creator_original' if original else 'rights_check_required','rights_status':'approved' if original else 'pending','supports':sec['claim_ids']})
    voice={'language':'Hindi','style':style,'pace':'measured','delivery':'clear, investigative, restrained','avoid':['overclaiming','fake certainty','sensational claims','imitating another creator']}
    return {'build':'04','topic':topic,'generated_at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'script':{'sections':sections,'sentences':sentences},'voice_plan':voice,'visual_asset_registry':visual,'qa':run_qa(sentences,claims,visual),'human_approval_required':True}
