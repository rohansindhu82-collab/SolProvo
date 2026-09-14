from __future__ import annotations
import json, os, sqlite3
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from analytics_engine import db_init, run_analytics

ROOT=Path(__file__).resolve().parent
DB=Path(os.getenv('CREATOR_OS_DB', ROOT/'creator_os.db'))
PORT=int(os.getenv('CREATOR_OS_ANALYTICS_PORT','8767'))

def conn():
    c=sqlite3.connect(DB); c.row_factory=sqlite3.Row; db_init(c); return c

class Handler(BaseHTTPRequestHandler):
    def log_message(self,fmt,*args): pass
    def send_json(self,status,obj):
        raw=json.dumps(obj,ensure_ascii=False,indent=2).encode(); self.send_response(status); self.send_header('Content-Type','application/json'); self.send_header('Content-Length',str(len(raw))); self.end_headers(); self.wfile.write(raw)
    def do_GET(self):
        if self.path=='/api/health': return self.send_json(200,{'ok':True,'build':'07','db':str(DB)})
        if self.path=='/api/analytics/insights':
            c=conn(); rows=[dict(x) for x in c.execute('SELECT * FROM performance_insights ORDER BY generated_at DESC LIMIT 50')]; c.close(); return self.send_json(200,rows)
        if self.path=='/api/analytics/feedback':
            c=conn(); rows=[dict(x) for x in c.execute('SELECT * FROM topic_feedback ORDER BY generated_at DESC LIMIT 50')]; c.close(); return self.send_json(200,rows)
        return self.send_json(404,{'error':'not_found'})
    def do_POST(self):
        if self.path!='/api/analytics/sync': return self.send_json(404,{'error':'not_found'})
        try:
            n=int(self.headers.get('Content-Length','0')); body=json.loads(self.rfile.read(n) or '{}')
            result=run_analytics(conn(),body['channel_id'],body['start_date'],body['end_date'],body.get('access_token') or os.getenv('YOUTUBE_ANALYTICS_ACCESS_TOKEN'),body.get('sample_rows'))
            return self.send_json(200,result)
        except Exception as e: return self.send_json(400,{'error':str(e)})

if __name__=='__main__':
    print(f'Creator OS Build 07 — Analytics Intelligence: http://127.0.0.1:{PORT}')
    ThreadingHTTPServer(('127.0.0.1',PORT),Handler).serve_forever()
