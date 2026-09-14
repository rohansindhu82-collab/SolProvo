"""Creator OS Build 03 — Narrative Intelligence Engine.
Deterministic-first narrative planning with optional local LLM enhancement.
No third-party dependencies.
"""
import re, hashlib, datetime
from collections import Counter
STOP=set("the a an and or but if then than of to in on for from with by is are was were be been this that these those what how why when where who which into over under about after before as at it its their they them we our you your not no can could would should will may might has have had do does did".split())
def tokens(text): return [x for x in re.findall(r"[a-zA-Z0-9]{3,}",(text or '').lower()) if x not in STOP]
def source_tier(source):
    t=(source.get('source_type') or '').lower();u=(source.get('url') or '').lower()
    if any(x in u for x in ['.gov','gov.in','nic.in','who.int','un.org','worldbank.org']): return ('primary',95)
    if any(x in u for x in ['edu','ac.uk','journals.','doi.org','arxiv.org']): return ('academic',92)
    if t in ('official','primary'): return ('primary',95)
    if t in ('news','web'): return ('secondary',65)
    return ('unknown',45)
def rank_sources(sources):
    out=[]
    for s in sources:
        tier,score=source_tier(s);x=dict(s);x['tier']=tier;x['authority_score']=score;out.append(x)
    return sorted(out,key=lambda x:(x['authority_score'],len(x.get('title',''))),reverse=True)
def claim_strength(claim,source,confidence=0):
    _,authority=source_tier(source or {});c=max(0,min(100,int(confidence or 0)));return min(100,round(authority*.55+c*.45))
def build_claim_matrix(claims,sources):
    by_id={int(s.get('id',0)):s for s in sources};matrix=[]
    for c in claims:
        src=by_id.get(int(c.get('source_id') or 0),{});x=dict(c);x['source_tier']=source_tier(src)[0];x['evidence_strength']=claim_strength(c.get('claim',''),src,c.get('confidence',0));x['verification_required']=x.get('status')!='verified';matrix.append(x)
    return sorted(matrix,key=lambda x:x['evidence_strength'],reverse=True)
def detect_conflicts(claims):
    buckets={}
    for c in claims:
        text=c.get('claim','');words=set(tokens(text));key=' '.join(sorted(list(words)[:8]));nums=re.findall(r'\b(?:1[0-9]{3}|20[0-9]{2}|\d{1,3}(?:,\d{3})+|\d+)\b',text)
        if nums:buckets.setdefault(key,[]).append((c,nums))
    out=[]
    for key,items in buckets.items():
        vals={tuple(x[1]) for x in items}
        if len(vals)>1 and len(items)>1:out.append({'cluster':key,'claim_ids':[x[0].get('id') for x in items],'values':[list(v) for v in vals],'status':'needs_review'})
    return out
def angle_candidates(topic,claims,discoveries):
    topic_clean=topic.strip().rstrip('?')
    return [
      {'type':'decision','title':f'What actually decided {topic_clean}?','thesis':'Follow the decisions, constraints and evidence rather than retelling the familiar chronology.','hook':'Everyone remembers the outcome. The interesting question is what made that outcome possible.'},
      {'type':'myth_vs_record','title':f'What the popular story gets wrong about {topic_clean}','thesis':'Separate widely repeated claims from what the available evidence can actually support.','hook':'The version most people know may be simpler than the historical record.'},
      {'type':'systems','title':f'The hidden system behind {topic_clean}','thesis':'Explain logistics, incentives, institutions, technology or geography that shaped the event.','hook':'The visible event was only the surface. The real story was the system underneath it.'}
    ]
def hook_variants(topic,angle): return [f"We know how {topic} ended. But the outcome was being shaped long before the moment everyone remembers.",f"The popular explanation for {topic} is neat. The evidence is messier — and much more interesting.",f"If you only study the headline version of {topic}, you miss the mechanism that actually explains it."]
def narrative_outline(topic,angle,claims,conflicts):
    return {'premise':angle.get('thesis',''),'structure':[
      {'beat':'cold_open','purpose':'Create a specific question, not a generic promise.','duration_sec':25},{'beat':'context','purpose':'Give only the minimum background needed to understand the question.','duration_sec':90},{'beat':'evidence','purpose':'Walk through the strongest source-backed claims in causal order.','duration_sec':240},{'beat':'counterweight','purpose':'Surface the strongest competing interpretation or unresolved evidence.','duration_sec':120},{'beat':'synthesis','purpose':'Answer the opening question and state what remains uncertain.','duration_sec':90}],
      'supported_claim_ids':[c.get('id') for c in claims if c.get('evidence_strength',0)>=70 and not c.get('verification_required')][:8],
      'claims_needing_review':[c.get('id') for c in claims if c.get('verification_required')][:6],'conflict_clusters':len(conflicts)}
def sentence_citation_plan(claims): return [{'claim_id':c.get('id'),'sentence_role':'factual','required_citation':True,'source_id':c.get('source_id'),'status':'verified' if c.get('status')=='verified' else 'needs_review'} for c in claims[:30]]
def shot_plan(topic,claims,angle): return [
 {'shot':1,'role':'hook','visual':'Original title card + map/timeline motif','provenance':'creator_original','supports':[]},{'shot':2,'role':'context','visual':'Map or timeline built from source-backed geography/dates','provenance':'create_or_license','supports':[c.get('id') for c in claims[:2]]},{'shot':3,'role':'evidence','visual':'Primary-source document, chart or archival material with on-screen citation','provenance':'rights_required','supports':[c.get('id') for c in claims[2:5]]},{'shot':4,'role':'analysis','visual':'Original explanatory diagram showing causal chain','provenance':'creator_original','supports':[c.get('id') for c in claims[5:8]]},{'shot':5,'role':'counterweight','visual':'Side-by-side evidence cards for competing interpretations','provenance':'creator_original','supports':[c.get('id') for c in claims[8:10]]},{'shot':6,'role':'close','visual':'Clean synthesis card; no fabricated archival imagery','provenance':'creator_original','supports':[]}]
def thumbnail_concepts(topic,angle): return [{'concept':'Question','text':'WHAT REALLY HAPPENED?','composition':'One dominant subject + one evidence object + high-contrast question mark; avoid fake scenes.'},{'concept':'Contradiction','text':'THE STORY IS NOT THAT SIMPLE','composition':'Two competing evidence cards separated by a visual divider.'},{'concept':'Mechanism','text':'THE HIDDEN REASON','composition':'Central diagram/arrow explaining the causal mechanism; minimal text.'}]
def shorts_candidates(topic,claims,angle): return [{'title':f'The 30-second question behind {topic}','hook':angle.get('hook',''),'source_claim_ids':[c.get('id') for c in claims[:2]]},{'title':f'One fact that changes how you see {topic}','hook':'Start with the strongest surprising, source-backed fact.','source_claim_ids':[c.get('id') for c in claims[2:4]]},{'title':f'The myth vs the evidence: {topic}','hook':'State the common claim, then show exactly what the evidence supports.','source_claim_ids':[c.get('id') for c in claims[4:6]]}]
def blog_brief(topic,angle,claims): return {'title':topic,'dek':angle.get('thesis',''),'sections':['What people usually believe','What the evidence says','Where sources disagree','What we can conclude','What remains uncertain'],'citation_policy':'Every factual assertion must map to a reviewed source-backed claim.','claims':[c.get('id') for c in claims[:20]]}
def build_narrative(topic,sources,claims,discoveries=None):
    discoveries=discoveries or [];ranked=rank_sources(sources);matrix=build_claim_matrix(claims,sources);conflicts=detect_conflicts(matrix);angles=angle_candidates(topic,matrix,discoveries);angle=angles[0]
    if sum(c['evidence_strength']>=70 for c in matrix)<3: angle=angles[2]
    return {'build':'03','topic':topic,'generated_at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'originality_rule':'Competitor outputs are treated as demand signals only; no script or asset copying.','sources':ranked[:30],'claim_matrix':matrix[:50],'conflicts':conflicts,'angles':angles,'selected_angle':angle,'hooks':hook_variants(topic,angle),'outline':narrative_outline(topic,angle,matrix,conflicts),'sentence_citation_plan':sentence_citation_plan(matrix),'shot_plan':shot_plan(topic,matrix,angle),'thumbnail_concepts':thumbnail_concepts(topic,angle),'shorts_candidates':shorts_candidates(topic,matrix,angle),'blog_brief':blog_brief(topic,angle,matrix),'quality_gates':{'minimum_reviewed_claims':sum(c.get('status')=='verified' for c in matrix)>=3,'conflicts_reviewed':len(conflicts)==0,'source_provenance':all(bool(c.get('source_id')) for c in matrix),'original_angle':True,'human_approval_required':True}}
