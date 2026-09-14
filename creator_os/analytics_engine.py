from __future__ import annotations
import json, sqlite3, statistics, time, urllib.parse, urllib.request, urllib.error, secrets
from dataclasses import dataclass
from typing import Any

ANALYTICS_SCOPE = 'https://www.googleapis.com/auth/yt-analytics.readonly'

def uid(prefix='id'): return f'{prefix}_{secrets.token_hex(6)}'
def now(): return time.time()

def db_init(conn: sqlite3.Connection):
    conn.executescript('''
    CREATE TABLE IF NOT EXISTS analytics_snapshots (
      id TEXT PRIMARY KEY, channel_id TEXT, start_date TEXT, end_date TEXT,
      dimensions TEXT NOT NULL, metrics TEXT NOT NULL, rows_json TEXT NOT NULL,
      provider TEXT NOT NULL, fetched_at REAL NOT NULL
    );
    CREATE TABLE IF NOT EXISTS video_performance (
      video_id TEXT NOT NULL, channel_id TEXT NOT NULL, as_of TEXT NOT NULL,
      views REAL DEFAULT 0, watch_time_minutes REAL DEFAULT 0,
      average_view_duration_seconds REAL DEFAULT 0, likes REAL DEFAULT 0,
      comments REAL DEFAULT 0, shares REAL DEFAULT 0, subscribers_gained REAL DEFAULT 0,
      subscribers_lost REAL DEFAULT 0, PRIMARY KEY(video_id, as_of)
    );
    CREATE TABLE IF NOT EXISTS performance_insights (
      id TEXT PRIMARY KEY, channel_id TEXT, generated_at REAL NOT NULL,
      kind TEXT NOT NULL, confidence REAL NOT NULL, evidence_json TEXT NOT NULL,
      recommendation TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS topic_feedback (
      id TEXT PRIMARY KEY, channel_id TEXT, generated_at REAL NOT NULL,
      signal TEXT NOT NULL, score REAL NOT NULL, evidence_json TEXT NOT NULL,
      action TEXT NOT NULL
    );
    ''')
    conn.commit()

@dataclass
class AnalyticsQuery:
    channel_id: str
    start_date: str
    end_date: str
    dimensions: str = 'video'
    metrics: str = 'views,watchTimeMinutes,averageViewDuration,likes,comments,shares,subscribersGained,subscribersLost'
    sort: str = '-views'
    max_results: int = 200

class YouTubeAnalyticsClient:
    def __init__(self, access_token: str): self.access_token = access_token
    def query(self, q: AnalyticsQuery) -> dict[str, Any]:
        params = {'ids': f'channel=={q.channel_id}', 'startDate': q.start_date, 'endDate': q.end_date, 'dimensions': q.dimensions, 'metrics': q.metrics, 'sort': q.sort, 'maxResults': str(q.max_results)}
        url = 'https://youtubeanalytics.googleapis.com/v2/reports?' + urllib.parse.urlencode(params)
        req = urllib.request.Request(url, headers={'Authorization': 'Bearer ' + self.access_token})
        try:
            with urllib.request.urlopen(req, timeout=30) as r: return json.loads(r.read())
        except urllib.error.HTTPError as e:
            raise RuntimeError(f'YouTube Analytics API {e.code}: {e.read().decode(errors="replace")[:1500]}')

def rows_from_report(report):
    headers=[h['name'] for h in report.get('columnHeaders', [])]
    return [dict(zip(headers,row)) for row in report.get('rows', [])]

def save_snapshot(conn, query, report, provider='youtube_analytics'):
    sid=uid('snap'); rows=rows_from_report(report)
    conn.execute('INSERT INTO analytics_snapshots VALUES (?,?,?,?,?,?,?,?,?)', (sid,query.channel_id,query.start_date,query.end_date,query.dimensions,query.metrics,json.dumps(rows),provider,now()))
    for r in rows:
        if 'video' in r:
            conn.execute('INSERT OR REPLACE INTO video_performance VALUES (?,?,?,?,?,?,?,?,?,?,?)', (r.get('video'),query.channel_id,query.end_date,float(r.get('views',0)),float(r.get('watchTimeMinutes',0)),float(r.get('averageViewDuration',0)),float(r.get('likes',0)),float(r.get('comments',0)),float(r.get('shares',0)),float(r.get('subscribersGained',0)),float(r.get('subscribersLost',0))))
    conn.commit(); return sid, rows

def percentile(values,p):
    if not values:return 0.0
    vals=sorted(values); k=(len(vals)-1)*p; f=int(k); c=min(f+1,len(vals)-1)
    return vals[f]+(vals[c]-vals[f])*(k-f)

def analyze_rows(rows):
    if not rows:return {'sample_size':0,'benchmarks':{},'leaders':[],'signals':[]}
    views=[float(r.get('views',0)) for r in rows]; watch=[float(r.get('watchTimeMinutes',0)) for r in rows]; avd=[float(r.get('averageViewDuration',0)) for r in rows]; likes=[float(r.get('likes',0)) for r in rows]; comments=[float(r.get('comments',0)) for r in rows]
    leaders=sorted(rows,key=lambda r:float(r.get('views',0)),reverse=True)[:10]
    b={'views_p50':percentile(views,.5),'views_p75':percentile(views,.75),'watch_time_p50':percentile(watch,.5),'avg_view_duration_p50':percentile(avd,.5),'like_rate_mean':statistics.mean([(l/v) if v else 0 for l,v in zip(likes,views)]),'comment_rate_mean':statistics.mean([(c/v) if v else 0 for c,v in zip(comments,views)])}
    signals=[{'video_id':r.get('video'),'views':float(r.get('views',0)),'like_rate':(float(r.get('likes',0))/float(r.get('views',0))) if float(r.get('views',0)) else 0,'avg_view_duration':float(r.get('averageViewDuration',0))} for r in leaders[:5]]
    return {'sample_size':len(rows),'benchmarks':b,'leaders':leaders,'signals':signals}

def generate_insights(analysis):
    b=analysis['benchmarks']; n=analysis['sample_size']; out=[]
    if not n:return out
    if analysis['signals']:
        out.append({'kind':'winner_pattern','confidence':0.72 if n>=10 else 0.55,'evidence':{'sample_size':n,'top_video':analysis['signals'][0]},'recommendation':'Prioritize structural characteristics of top-performing topics/hooks, but generate a fresh thesis and evidence package for every new piece.'})
    if b['like_rate_mean']>0.04:
        out.append({'kind':'engagement','confidence':0.68,'evidence':{'mean_like_rate':b['like_rate_mean']},'recommendation':'Preserve strong audience-response mechanics in future concepts; do not infer causality from this signal alone.'})
    if b['avg_view_duration_p50']>90:
        out.append({'kind':'watch_depth','confidence':0.70,'evidence':{'median_average_view_duration_seconds':b['avg_view_duration_p50']},'recommendation':'Test deeper narrative structures and stronger mid-video evidence transitions on future topics.'})
    return out

def run_analytics(conn, channel_id, start_date, end_date, access_token=None, sample_rows=None):
    db_init(conn); q=AnalyticsQuery(channel_id,start_date,end_date)
    if sample_rows is not None:
        report={'columnHeaders':[{'name':k} for k in sample_rows[0].keys()] if sample_rows else [],'rows':[list(x.values()) for x in sample_rows]}; provider='sample'
    else:
        if not access_token: raise ValueError('YOUTUBE_ANALYTICS_ACCESS_TOKEN is required unless sample_rows are supplied')
        report=YouTubeAnalyticsClient(access_token).query(q); provider='youtube_analytics'
    sid,rows=save_snapshot(conn,q,report,provider); analysis=analyze_rows(rows); insights=generate_insights(analysis)
    for i in insights:
        conn.execute('INSERT INTO performance_insights VALUES (?,?,?,?,?,?,?)',(uid('ins'),channel_id,now(),i['kind'],i['confidence'],json.dumps(i['evidence']),i['recommendation']))
    for i in insights:
        conn.execute('INSERT INTO topic_feedback VALUES (?,?,?,?,?,?,?)',(uid('feedback'),channel_id,now(),i['kind'],float(i['confidence']),json.dumps(i['evidence']),i['recommendation']))
    conn.commit(); return {'snapshot_id':sid,'analysis':analysis,'insights':insights}
