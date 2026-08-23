"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, FileSearch, Loader2, MapPinned, Plus, ShieldCheck, TriangleAlert, XCircle } from "lucide-react";

type Result={url:string;title:string;score:number;opportunities:number;status:"ready"|"error";message:string};

export default function DiscoveryPage(){
 const [urls,setUrls]=useState(""); const [results,setResults]=useState<Result[]>([]); const [loading,setLoading]=useState(false); const [category,setCategory]=useState("Real estate"); const [location,setLocation]=useState("Noida / Greater Noida");
 const cleanUrls=useMemo(()=>Array.from(new Set(urls.split(/[\n,]+/).map(x=>x.trim()).filter(Boolean))),[urls]);
 async function discover(){
  if(!cleanUrls.length)return; setLoading(true); setResults([]);
  const next:Result[]=[];
  for(const url of cleanUrls.slice(0,10)){
   try{const r=await fetch("/api/audit",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({url,businessName:category})});const data=await r.json();if(!r.ok)throw new Error(data.error||"Audit failed");next.push({url,title:data.audit.title,score:data.audit.score,opportunities:data.audit.opportunities.length,status:"ready",message:"Evidence collected"});}
   catch(e){next.push({url,title:"Could not analyze",score:0,opportunities:0,status:"error",message:e instanceof Error?e.message:"Audit failed"});}
  }
  setResults(next);setLoading(false);
 }
 return <main className="content" style={{maxWidth:1180,margin:"0 auto"}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:28}}><Link href="/" className="btn" style={{textDecoration:"none"}}><ArrowLeft size={14} style={{verticalAlign:"-2px",marginRight:6}}/>ProspectOS</Link><span className="badge muted"><ShieldCheck size={12} style={{verticalAlign:"-2px",marginRight:4}}/>Evidence-first discovery</span></div>
 <div className="card panel" style={{marginBottom:18}}><div style={{display:"flex",gap:12,alignItems:"center",marginBottom:8}}><MapPinned size={20} color="var(--blue)"/><h1>Discovery Engine</h1></div><p className="sub">Turn a list of public business websites into an evidence-backed prospect queue. No fabricated businesses, ratings, contacts or gaps.</p>
 <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginTop:22}}><div><label className="panel-note">Vertical</label><select className="select" style={{width:"100%",marginTop:6}} value={category} onChange={e=>setCategory(e.target.value)}><option>Real estate</option><option>Dental clinic</option><option>Local services</option></select></div><div><label className="panel-note">Target market</label><input className="search" style={{width:"100%",marginTop:6}} value={location} onChange={e=>setLocation(e.target.value)}/></div></div>
 <div style={{marginTop:14}}><label className="panel-note">Public website URLs · up to 10 per batch</label><textarea className="search" style={{width:"100%",minHeight:150,marginTop:6,resize:"vertical"}} placeholder={'example-business.in\nhttps://another-business.com'} value={urls} onChange={e=>setUrls(e.target.value)}/></div>
 <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:12}}><span className="panel-note">{cleanUrls.length}/10 URLs queued · {location}</span><button className="btn primary" disabled={!cleanUrls.length||loading} onClick={discover}>{loading?<><Loader2 size={14} className="spin" style={{verticalAlign:"-2px",marginRight:6}}/>Auditing batch…</>:<><Plus size={14} style={{verticalAlign:"-2px",marginRight:6}}/>Build prospect queue</>}</button></div></div>
 {results.length>0&&<div className="card table"><table><thead><tr><th>Website</th><th>Score</th><th>Opportunities</th><th>Evidence</th><th></th></tr></thead><tbody>{results.map(r=><tr key={r.url}><td><div className="business"><div className="business-icon"><FileSearch size={15}/></div><div><div className="business-name">{r.title}</div><div className="business-meta">{r.url}</div></div></div></td><td>{r.status==="ready"?<span className={`score ${r.score>=70?"high":r.score>=50?"medium":"low"}`}>{r.score}/100</span>:"—"}</td><td>{r.status==="ready"?<span className={r.opportunities?"badge hot":"badge muted"}>{r.opportunities} signals</span>:"—"}</td><td><span className={r.status==="ready"?"badge hot":"badge warn"}>{r.status==="ready"?<><CheckCircle2 size={12} style={{marginRight:4}}/>Evidence collected</>:<><XCircle size={12} style={{marginRight:4}}/>Failed</>}</span><div className="business-meta">{r.message}</div></td><td>{r.status==="ready"&&<Link className="link-btn" href={`/analyze?url=${encodeURIComponent(r.url)}`}>Open audit</Link>}</td></tr>)}</tbody></table></div>}
 <div className="card panel" style={{marginTop:18,background:"var(--blue-soft)"}}><strong style={{fontSize:12}}>Next layer</strong><p className="panel-note" style={{marginTop:6,lineHeight:1.5}}>This batch engine intentionally accepts public URLs rather than silently scraping directories. The next production connector can ingest a legitimate directory/API source, then feed every discovered URL through this same audit pipeline.</p></div>
 </main>;
}
