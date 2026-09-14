from __future__ import annotations
import base64, hashlib, json, os, secrets, time, urllib.parse, urllib.request, urllib.error
from pathlib import Path
from typing import Any

SCOPES = ["https://www.googleapis.com/auth/youtube.upload"]

def uid(prefix="id"): return f"{prefix}_{secrets.token_hex(6)}"
def now(): return time.time()

def sha256_file(path: Path):
    h=hashlib.sha256()
    with path.open("rb") as f:
        while chunk:=f.read(1024*1024): h.update(chunk)
    return h.hexdigest()

def youtube_auth_url(client_id: str, redirect_uri: str, state: str, scope: str=" ".join(SCOPES)):
    q={"client_id":client_id,"redirect_uri":redirect_uri,"response_type":"code","scope":scope,"access_type":"offline","include_granted_scopes":"true","state":state,"prompt":"consent"}
    return "https://accounts.google.com/o/oauth2/v2/auth?"+urllib.parse.urlencode(q)

def exchange_google_code(client_id, client_secret, code, redirect_uri):
    data=urllib.parse.urlencode({"code":code,"client_id":client_id,"client_secret":client_secret,"redirect_uri":redirect_uri,"grant_type":"authorization_code"}).encode()
    req=urllib.request.Request("https://oauth2.googleapis.com/token",data=data,headers={"Content-Type":"application/x-www-form-urlencoded"})
    with urllib.request.urlopen(req,timeout=30) as r: return json.loads(r.read())

def refresh_google_token(client_id, client_secret, refresh_token):
    data=urllib.parse.urlencode({"client_id":client_id,"client_secret":client_secret,"refresh_token":refresh_token,"grant_type":"refresh_token"}).encode()
    req=urllib.request.Request("https://oauth2.googleapis.com/token",data=data,headers={"Content-Type":"application/x-www-form-urlencoded"})
    with urllib.request.urlopen(req,timeout=30) as r: return json.loads(r.read())

def validate_package(pkg: dict[str,Any]):
    issues=[]
    if pkg.get("status")!="approved": issues.append("package_not_human_approved")
    output=pkg.get("render_output") or pkg.get("output")
    if not output or not Path(output).exists(): issues.append("render_output_missing")
    if pkg.get("rights_clear") is not True: issues.append("rights_not_cleared")
    if not pkg.get("title","").strip(): issues.append("title_missing")
    if len(pkg.get("title",""))>100: issues.append("title_too_long")
    if len(pkg.get("description",""))>5000: issues.append("description_too_long")
    return {"ok":not issues,"issues":issues}

def build_youtube_metadata(pkg):
    return {"snippet":{"title":pkg["title"].strip(),"description":pkg.get("description","").strip(),"tags":pkg.get("tags",[]),"categoryId":str(pkg.get("category_id","22")),"defaultLanguage":pkg.get("language","en")},"status":{"privacyStatus":pkg.get("privacy_status","private"),"selfDeclaredMadeForKids":bool(pkg.get("made_for_kids",False))}}

def youtube_upload(pkg, credentials):
    check=validate_package(pkg)
    if not check["ok"]: return {"status":"blocked","validation":check}
    try:
        from googleapiclient.discovery import build
        from googleapiclient.http import MediaFileUpload
        from google.oauth2.credentials import Credentials
    except ImportError:
        return {"status":"adapter_unavailable","reason":"Install google-api-python-client and google-auth-oauthlib to enable YouTube publishing.","validation":check}
    creds=Credentials(token=credentials.get("access_token"),refresh_token=credentials.get("refresh_token"),token_uri="https://oauth2.googleapis.com/token",client_id=credentials.get("client_id"),client_secret=credentials.get("client_secret"),scopes=SCOPES)
    youtube=build("youtube","v3",credentials=creds)
    body=build_youtube_metadata(pkg)
    media=MediaFileUpload(pkg["render_output"],chunksize=8*1024*1024,resumable=True)
    request=youtube.videos().insert(part="snippet,status",body=body,media_body=media)
    response=None
    while response is None:
        _,response=request.next_chunk()
    return {"status":"published","provider":"youtube","video_id":response.get("id"),"url":f"https://www.youtube.com/watch?v={response.get('id')}","metadata":body}

def wordpress_publish(pkg, base_url, username, application_password):
    check=validate_package(pkg)
    if not check["ok"]: return {"status":"blocked","validation":check}
    token=base64.b64encode(f"{username}:{application_password}".encode()).decode()
    payload={"title":pkg["title"],"content":pkg.get("content",pkg.get("description","")),"status":pkg.get("wp_status","draft"),"slug":pkg.get("slug")}
    data=json.dumps(payload).encode()
    req=urllib.request.Request(base_url.rstrip("/")+"/wp-json/wp/v2/posts",data=data,headers={"Authorization":"Basic "+token,"Content-Type":"application/json"},method="POST")
    try:
        with urllib.request.urlopen(req,timeout=30) as r: out=json.loads(r.read())
    except urllib.error.HTTPError as e:
        return {"status":"failed","provider":"wordpress","http_status":e.code,"error":e.read().decode(errors="replace")[:2000]}
    return {"status":"published","provider":"wordpress","post_id":out.get("id"),"url":out.get("link"),"wp_status":out.get("status")}

def prepare_distribution(pkg, provider):
    check=validate_package(pkg)
    if provider=="youtube": payload=build_youtube_metadata(pkg)
    elif provider=="wordpress": payload={"title":pkg.get("title"),"status":pkg.get("wp_status","draft"),"slug":pkg.get("slug")}
    else: raise ValueError("unsupported_provider")
    return {"distribution_id":uid("dist"),"provider":provider,"status":"ready" if check["ok"] else "blocked","validation":check,"payload":payload,"prepared_at":now()}
