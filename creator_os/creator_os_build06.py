from __future__ import annotations
import json, os, secrets, sqlite3, time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlparse, parse_qs
from distribution_engine import youtube_auth_url, exchange_google_code, prepare_distribution, youtube_upload, wordpress_publish, validate_package

ROOT=Path(__file__).resolve().parent; DB=ROOT/'creator_os.db'; EXPORTS=ROOT/'distribution'; EXPORTS.mkdir(exist_ok=True)

def db():
    c=sqlite3.connect(DB); c.row_factory=sqlite3.Row; return c

def init():
    c=db(); c.executescript('''
    CREATE TABLE IF NOT EXISTS distribution_packages(id TEXT PRIMARY KEY, data TEXT NOT NULL, created_at REAL NOT NULL);
    CREATE TABLE IF NOT EXISTS distribution_runs(id TEXT PRIMARY KEY, data TEXT NOT NULL, created_at REAL NOT NULL);
    CREATE TABLE IF NOT EXISTS oauth_states(state TEXT PRIMARY KEY, provider TEXT NOT NULL, created_at REAL NOT NULL);
    '''); c.commit(); c.close()

def save(table, key, data):
    c=db(); c.execute(f'INSERT OR REPLACE INTO {table}(id,data,created_at) VALUES(?,?,?)',(key,json.dumps(data,ensure_ascii=False),time.time())); c.commit(); c.close()

def rows(table):
    c=db(); out=[json.loads(r['data']) for r in c.execute(f'SELECT data FROM {table} ORDER BY created_at DESC')]; c.close(); return out

class H(BaseHTTPRequestHandler):
    def j(self,obj,status=200):
        b=json.dumps(obj,ensure_ascii=False,indent=2).encode(); self.send_response(status); self.send_header('Content-Type','application/json'); self.send_header('Content-Length',str(len(b))); self.end_headers(); self.wfile.write(b)
    def body(self): return json.loads(self.rfile.read(int(self.headers.get('Content-Length','0'))) or '{}')
    def do_GET(self):
        p=urlparse(self.path)
        if p.path=='/api/health': return self.j({'ok':True,'build':'06','providers':['youtube','wordpress']})
        if p.path=='/api/distribution': return self.j(rows('distribution_packages'))
        if p.path=='/api/runs': return self.j(rows('distribution_runs'))
        if p.path=='/api/youtube/auth':
            client=os.getenv('YOUTUBE_CLIENT_ID'); redirect=os.getenv('YOUTUBE_REDIRECT_URI','http://127.0.0.1:8766/oauth/youtube/callback')
            if not client: return self.j({'error':'YOUTUBE_CLIENT_ID missing'},400)
            state=secrets.token_urlsafe(24); c=db(); c.execute('INSERT INTO oauth_states VALUES(?,?,?)',(state,'youtube',time.time())); c.commit(); c.close()
            return self.j({'authorization_url':youtube_auth_url(client,redirect,state),'state':state})
        if p.path=='/oauth/youtube/callback':
            q=parse_qs(p.query); code=(q.get('code') or [None])[0]; state=(q.get('state') or [None])[0]
            if not code or not state: return self.j({'error':'missing_oauth_callback'},400)
            c=db(); ok=c.execute('SELECT 1 FROM oauth_states WHERE state=? AND provider=?',(state,'youtube')).fetchone(); c.execute('DELETE FROM oauth_states WHERE state=?',(state,)); c.commit(); c.close()
            if not ok: return self.j({'error':'invalid_oauth_state'},400)
            tokens=exchange_google_code(os.getenv('YOUTUBE_CLIENT_ID'),os.getenv('YOUTUBE_CLIENT_SECRET'),code,os.getenv('YOUTUBE_REDIRECT_URI','http://127.0.0.1:8766/oauth/youtube/callback'))
            return self.j({'ok':True,'message':'OAuth completed. Store the refresh token securely; do not commit it.','token_fields':list(tokens.keys()),'refresh_token_present':bool(tokens.get('refresh_token'))})
        return self.j({'error':'not_found'},404)
    def do_POST(self):
        try:
            p=self.path; d=self.body()
            if p=='/api/distribution/prepare':
                out=prepare_distribution(d['package'],d['provider']); save('distribution_packages',out['distribution_id'],out); return self.j(out,200 if out['status']=='ready' else 409)
            if p=='/api/distribution/publish':
                pkg=d['package']; provider=d['provider']; check=validate_package(pkg)
                if not check['ok']: return self.j({'status':'blocked','validation':check},409)
                if d.get('dry_run',True):
                    out={'run_id':'dry_'+secrets.token_hex(6),'status':'dry_run','provider':provider,'validation':check,'would_publish':True}; save('distribution_runs',out['run_id'],out); return self.j(out)
                if d.get('approved_by')!='human_operator': return self.j({'status':'blocked','reason':'human_approval_required'},409)
                if provider=='youtube': out=youtube_upload(pkg,d['credentials'])
                elif provider=='wordpress': out=wordpress_publish(pkg,d['base_url'],d['username'],d['application_password'])
                else: return self.j({'error':'unsupported_provider'},400)
                out['run_id']='run_'+secrets.token_hex(6); save('distribution_runs',out['run_id'],out); return self.j(out,200 if out['status']=='published' else 409)
            return self.j({'error':'not_found'},404)
        except Exception as e: return self.j({'error':str(e)},400)
    def log_message(self,*args): pass

if __name__=='__main__':
    init(); print('Creator OS Build 06 → http://127.0.0.1:8766'); ThreadingHTTPServer(('127.0.0.1',8766),H).serve_forever()
