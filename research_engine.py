"""Creator OS research intelligence engine."""
from urllib.request import Request, urlopen
from urllib.parse import urlencode
import os, json, re, html, datetime
import xml.etree.ElementTree as ET
USER_AGENT='CreatorOS/0.2 research-engine'
def http(url, timeout=20):
    req=Request(url, headers={'User-Agent':USER_AGENT,'Accept':'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'})
    with urlopen(req, timeout=timeout) as r:return r.read(),r.headers.get('content-type','')
def clean_text(raw):
    text=raw.decode('utf-8','ignore') if isinstance(raw,(bytes,bytearray)) else str(raw)
    text=re.sub(r'<script[\s\S]*?</script>|<style[\s\S]*?</style>|<noscript[\s\S]*?</noscript>',' ',text,flags=re.I)
    text=re.sub(r'<[^>]+>',' ',text);text=html.unescape(text);return re.sub(r'\s+',' ',text).strip()
def fetch_page(url):
    raw,ctype=http(url);return {'url':url,'content_type':ctype,'text':clean_text(raw)[:50000]}
def youtube_search(query,max_results=10):
    key=os.getenv('YOUTUBE_API_KEY','').strip()
    if not key:return {'configured':False,'items':[],'message':'Set YOUTUBE_API_KEY to enable official YouTube discovery.'}
    p=urlencode({'part':'snippet','q':query,'type':'video','maxResults':min(max_results,50),'order':'viewCount','regionCode':os.getenv('YOUTUBE_REGION','IN'),'key':key})
    raw,_=http('https://www.googleapis.com/youtube/v3/search?'+p);data=json.loads(raw.decode());ids=[x.get('id',{}).get('videoId') for x in data.get('items',[]) if x.get('id',{}).get('videoId')]
    details=[]
    if ids:
        raw,_=http('https://www.googleapis.com/youtube/v3/videos?'+urlencode({'part':'snippet,statistics,contentDetails','id':','.join(ids),'key':key}));details=json.loads(raw.decode()).get('items',[])
    return {'configured':True,'items':details,'quota_note':'Cache discovery results in Creator OS to control quota usage.'}
def google_news(query,max_results=12):
    raw,_=http('https://news.google.com/rss/search?'+urlencode({'q':query,'hl':'en-IN','gl':'IN','ceid':'IN:en'}));root=ET.fromstring(raw);items=[]
    for item in root.findall('.//item')[:max_results]:
        def t(tag):
            e=item.find(tag);return (e.text or '').strip() if e is not None else ''
        items.append({'title':html.unescape(t('title')),'url':t('link'),'published':t('pubDate'),'source_type':'news'})
    return items
def score_signal(item,query):
    title=(item.get('title') or '').lower();q=set(re.findall(r'[a-z0-9]+',query.lower()));overlap=len(q & set(re.findall(r'[a-z0-9]+',title)));views=int(item.get('statistics',{}).get('viewCount',0) or item.get('views',0) or 0);view_score=min(100,len(str(views))**2*4 if views else 0);return min(100,45+overlap*10+view_score//3)
def discover(query):
    yt=youtube_search(query,10);news=[]
    try:news=google_news(query,10)
    except Exception as e:news=[{'error':str(e)}]
    items=[]
    for x in yt.get('items',[]):
        vid=x.get('id') if isinstance(x.get('id'),str) else x.get('id',{}).get('videoId','');items.append({'kind':'youtube','id':vid,'title':x.get('snippet',{}).get('title',''),'channel':x.get('snippet',{}).get('channelTitle',''),'published':x.get('snippet',{}).get('publishedAt',''),'views':int(x.get('statistics',{}).get('viewCount',0) or 0),'url':'https://www.youtube.com/watch?v='+vid})
    for x in news:items.append({'kind':'news',**x})
    for x in items:x['signal']=score_signal(x,query)
    return {'query':query,'generated_at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'youtube_configured':yt.get('configured',False),'items':sorted(items,key=lambda z:z.get('signal',0),reverse=True)}
def research_contract(topic):
    return {'topic':topic,'gates':['Demand signal collected','Primary/authoritative sources prioritized','Claim ledger created','Conflicts explicitly recorded','Original angle separated from competitor narratives','Visual provenance recorded','Script QA completed','Human approval before publish'],'deliverables':['research brief','source graph','claim ledger','original outline','Hindi script','shot list','voice plan','thumbnail brief','blog article','shorts candidates']}
def extract_claim_candidates(text,limit=30):
    sentences=re.split(r'(?<=[.!?।])\s+',text);out=[]
    for s in sentences:
        s=s.strip()
        if len(s)<45 or len(s)>360:continue
        if re.search(r'\b(19|20|17|16|15|14)\d{2}\b|\b\d{1,3}(?:,\d{3})+\b|\b(?:first|second|third|largest|only|approximately|million|thousand)\b',s,re.I):out.append(s)
        if len(out)>=limit:break
    return out
