#!/usr/bin/env python3
"""Creator OS Build 04 — clean production-intelligence server."""
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlparse,parse_qs
import sqlite3,json,os,datetime
from production_engine import build_production_package,run_qa
from narrative_engine import build_narrative
DB=os.path.join(os.path.dirname(os.path.abspath(__file__)),'creator_os.db');PORT=int(os.getenv('PORT','8787'))
def now(): return datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
def db():
 c=sqlite3.connect(DB);c.row_factory=sqlite3.Row
 c.executescript('''CREATE TABLE IF NOT EXISTS topics(id INTEGER PRIMARY KEY AUTOINCREMENT,title TEXT,status TEXT,created_at TEXT);CREATE TABLE IF NOT EXISTS sources(id INTEGER PRIMARY KEY AUTOINCREMENT,topic_id INTEGER,url TEXT,title TEXT,source_type TEXT,trust INTEGER,notes TEXT);CREATE TABLE IF NOT EXISTS claims(id INTEGER PRIMARY KEY AUTOINCREMENT,topic_id INTEGER,claim TEXT,source_id INTEGER,confidence INTEGER,status TEXT,conflict TEXT,notes TEXT);CREATE TABLE IF NOT EXISTS narrative_packages(id INTEGER PRIMARY KEY AUTOINCREMENT,topic_id INTEGER,payload TEXT,created_at TEXT,version INTEGER);CREATE TABLE IF NOT EXISTS production_packages(id INTEGER PRIMARY KEY AUTOINCREMENT,topic_id INTEGER,payload TEXT,created_at TEXT,version INTEGER);''');return c
def rows(c,q,a=()): return [dict(r) for r in c.execute(q,a).fetchall()]
class H(BaseHTTPRequestHandler):
 def send_json(self,d,status=200):
  b=json.dumps(d,ensure_ascii=False).encode();self.send_response(status);self.send_header('Content-Type','application/json');self.send_header('Content-Length',str(len(b)));self.end_headers();self.wfile.write(b)
 def body(self):
  n=int(self.headers.get('Content-Length','0'));return json.loads(self.rfile.read(n) or '{}')
 def do_GET(self):
  p=urlparse(self.path);q=parse_qs(p.query);c=db()
  if p.path=='/api/health': return self.send_json({'ok':True,'build':'04','production_intelligence':True})
  if p.path=='/api/topics': return self.send_json({'topics':rows(c,'SELECT * FROM topics ORDER BY id DESC')})
  if p.path=='/api/narrative/latest':
   tid=int(q.get('topic_id',['0'])[0]);r=c.execute('SELECT * FROM narrative_packages WHERE topic_id=? ORDER BY version DESC LIMIT 1',(tid,)).fetchone();return self.send_json({'package':json.loads(r['payload']) if r else None,'version':r['version'] if r else 0})
  if p.path=='/api/production/latest':
   tid=int(q.get('topic_id',['0'])[0]);r=c.execute('SELECT * FROM production_packages WHERE topic_id=? ORDER BY version DESC LIMIT 1',(tid,)).fetchone();return self.send_json({'package':json.loads(r['payload']) if r else None,'version':r['version'] if r else 0})
  if p.path=='/api/production/qa':
   tid=int(q.get('topic_id',['0'])[0]);r=c.execute('SELECT * FROM production_packages WHERE topic_id=? ORDER BY version DESC LIMIT 1',(tid,)).fetchone();return self.send_json({'qa':json.loads(r['payload']).get('qa') if r else None})
  return self.send_json({'error':'not found'},404)
 def do_POST(self):
  p=urlparse(self.path).path;b=self.body();c=db()
  if p=='/api/narrative/build':
   tid=int(b.get('topic_id',0) or 0);topic=str(b.get('topic','')).strip()
   if not tid:
    r=c.execute('INSERT INTO topics(title,status,created_at) VALUES(?,?,?)',(topic,'researching',now()));tid=r.lastrowid;c.commit()
   if not topic: topic=c.execute('SELECT title FROM topics WHERE id=?',(tid,)).fetchone()['title']
   src=rows(c,'SELECT * FROM sources WHERE topic_id=?',(tid,));claims=rows(c,'SELECT * FROM claims WHERE topic_id=?',(tid,));package=build_narrative(topic,src,claims,[]);v=(c.execute('SELECT COALESCE(MAX(version),0)+1 v FROM narrative_packages WHERE topic_id=?',(tid,)).fetchone()['v']);c.execute('INSERT INTO narrative_packages(topic_id,payload,created_at,version) VALUES(?,?,?,?)',(tid,json.dumps(package,ensure_ascii=False),now(),v));c.commit();return self.send_json({'ok':True,'topic_id':tid,'version':v,'package':package})
  if p=='/api/production/build':
   tid=int(b.get('topic_id',0) or 0);nr=c.execute('SELECT payload FROM narrative_packages WHERE topic_id=? ORDER BY version DESC LIMIT 1',(tid,)).fetchone()
   if not nr:return self.send_json({'error':'Build narrative first.'},409)
   topic=c.execute('SELECT title FROM topics WHERE id=?',(tid,)).fetchone()['title'];claims=rows(c,'SELECT claims.*,sources.url,sources.title source_title FROM claims LEFT JOIN sources ON sources.id=claims.source_id WHERE claims.topic_id=? ORDER BY claims.id',(tid,));package=build_production_package(topic,json.loads(nr['payload']),claims,b.get('style','documentary'));v=c.execute('SELECT COALESCE(MAX(version),0)+1 v FROM production_packages WHERE topic_id=?',(tid,)).fetchone()['v'];c.execute('INSERT INTO production_packages(topic_id,payload,created_at,version) VALUES(?,?,?,?)',(tid,json.dumps(package,ensure_ascii=False),now(),v));c.commit();return self.send_json({'ok':True,'topic_id':tid,'version':v,'package':package})
  if p=='/api/production/rights':
   tid=int(b.get('topic_id',0) or 0);vid=str(b.get('visual_id',''));r=c.execute('SELECT * FROM production_packages WHERE topic_id=? ORDER BY version DESC LIMIT 1',(tid,)).fetchone()
   if not r:return self.send_json({'error':'No production package.'},404)
   package=json.loads(r['payload']);found=False
   for v in package.get('visual_asset_registry',[]):
    if v.get('id')==vid:v['rights_status']='approved';v['rights_note']=b.get('note','Human rights clearance');found=True
   if not found:return self.send_json({'error':'visual_id not found'},404)
   claims=rows(c,'SELECT * FROM claims WHERE topic_id=?',(tid,));package['qa']=run_qa(package['script']['sentences'],claims,package['visual_asset_registry']);c.execute('UPDATE production_packages SET payload=? WHERE id=?',(json.dumps(package,ensure_ascii=False),r['id']));c.commit();return self.send_json({'ok':True,'package':package})
  if p=='/api/production/approve':
   tid=int(b.get('topic_id',0) or 0);r=c.execute('SELECT * FROM production_packages WHERE topic_id=? ORDER BY version DESC LIMIT 1',(tid,)) .fetchone()
   if not r:return self.send_json({'error':'No production package.'},404)
   package=json.loads(r['payload'])
   if not package.get('qa',{}).get('publish_ready'):return self.send_json({'error':'Blocked by production QA or rights gate.','qa':package.get('qa',{})},409)
   package['approval']={'status':'approved','approved_at':now(),'approved_by':'human_operator'};c.execute('UPDATE production_packages SET payload=? WHERE id=?',(json.dumps(package,ensure_ascii=False),r['id']));c.commit();return self.send_json({'ok':True,'approval':package['approval']})
  return self.send_json({'error':'not found'},404)
if __name__=='__main__': db().close();print(f'Creator OS Build 04 running on {PORT}');ThreadingHTTPServer(('0.0.0.0',PORT),H).serve_forever()
