"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CalendarClock, CheckCircle2, ChevronRight, MessageCircle, Plus, Search, Target, UserRound, Clock3, StickyNote } from "lucide-react";
import { addActivity, loadActivities, loadProspects, updateProspect, workspaceEventName, type ProspectStage, type WorkspaceProspect } from "@/lib/workspace";

const stages: ProspectStage[] = ["New", "Contacted", "Interested", "Demo", "Won", "Disqualified"];

function nextActionFor(stage: ProspectStage) {
  if (stage === "Won") return "Start BusinessOS onboarding";
  if (stage === "Demo") return "Prepare personalized demo";
  if (stage === "Interested") return "Schedule follow-up";
  if (stage === "Contacted") return "Follow up with relevant evidence";
  if (stage === "Disqualified") return "No further action";
  return "Review verified opportunity";
}

function formatDate(value?: string) {
  if (!value) return "No follow-up set";
  return new Date(value).toLocaleString("en-IN", { day:"2-digit", month:"short", hour:"2-digit", minute:"2-digit" });
}

export default function SalesPage() {
  const [leads, setLeads] = useState<WorkspaceProspect[]>([]), [query, setQuery] = useState(""), [selected, setSelected] = useState<WorkspaceProspect | null>(null), [note, setNote] = useState(""), [followUp, setFollowUp] = useState("");
  const refresh = () => setLeads(loadProspects());
  useEffect(() => { refresh(); window.addEventListener(workspaceEventName(), refresh); return () => window.removeEventListener(workspaceEventName(), refresh); }, []);
  const visible = useMemo(() => leads.filter(l => `${l.name} ${l.category} ${l.location}`.toLowerCase().includes(query.toLowerCase())), [leads, query]);

  function move(id: string, stage: ProspectStage) {
    updateProspect(id, { stage, nextAction: nextActionFor(stage) });
    refresh();
  }
  function saveFollowUp() {
    if (!selected || !followUp) return;
    updateProspect(selected.id, { followUpAt: new Date(followUp).toISOString(), nextAction: "Follow up on scheduled date" });
    addActivity({ prospectId:selected.id, type:"follow-up", title:"Follow-up scheduled", detail:formatDate(new Date(followUp).toISOString()) });
    setSelected(loadProspects().find(x=>x.id===selected.id)||null); refresh();
  }
  function saveNote() {
    if (!selected || !note.trim()) return;
    addActivity({ prospectId:selected.id, type:"note", title:"Sales note added", detail:note.trim() });
    setNote("");
  }

  return <main className="content" style={{maxWidth:1500,margin:"0 auto"}}>
    <div className="header"><div><Link href="/" className="btn" style={{textDecoration:"none",display:"inline-block",marginBottom:14}}><ArrowLeft size={14} style={{verticalAlign:"-2px",marginRight:6}}/>ProspectOS</Link><h1>Sales Command Center</h1><p className="sub">Move verified prospects through contact, demo and customer conversion with one shared lifecycle.</p></div><div className="actions"><Link href="/discovery" className="btn"><Plus size={14} style={{verticalAlign:"-2px",marginRight:5}}/>Find prospects</Link><Link href="/demo" className="btn primary">Create demo</Link></div></div>
    <div className="stats"><div className="card stat"><div className="stat-top"><span>Pipeline</span><Target size={15}/></div><div className="stat-value">{leads.filter(l=>l.stage!=="Won"&&l.stage!=="Disqualified").length}</div><div className="stat-note">Active prospects</div></div><div className="card stat"><div className="stat-top"><span>Interested + demo</span><CheckCircle2 size={15}/></div><div className="stat-value">{leads.filter(l=>l.stage==="Interested"||l.stage==="Demo").length}</div><div className="stat-note">Ready for follow-up</div></div><div className="card stat"><div className="stat-top"><span>Action queue</span><CalendarClock size={15}/></div><div className="stat-value">{leads.filter(l=>l.stage!=="Won"&&l.stage!=="Disqualified").length}</div><div className="stat-note neutral">One next action per prospect</div></div><div className="card stat"><div className="stat-top"><span>Won</span><CheckCircle2 size={15}/></div><div className="stat-value">{leads.filter(l=>l.stage==="Won").length}</div><div className="stat-note neutral">Ready for BusinessOS onboarding</div></div></div>
    <div className="card toolbar"><div style={{position:"relative",flex:1}}><Search size={15} style={{position:"absolute",left:12,top:10,color:"#8a95a5"}}/><input className="search" style={{paddingLeft:36}} value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search prospect, business, vertical or location…"/></div></div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(6,minmax(180px,1fr))",gap:12,marginTop:14,overflowX:"auto"}}>{stages.map(stage=><div key={stage} className="card" style={{padding:12,minHeight:340}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}><strong style={{fontSize:12}}>{stage}</strong><span className="badge muted">{visible.filter(l=>l.stage===stage).length}</span></div>{visible.filter(l=>l.stage===stage).map(l=><div key={l.id} onClick={()=>{setSelected(l);setFollowUp(l.followUpAt ? new Date(l.followUpAt).toISOString().slice(0,16):"")}} style={{background:"#fff",border:"1px solid var(--line)",borderRadius:10,padding:12,marginBottom:9,boxShadow:"0 5px 15px rgba(23,32,42,.04)",cursor:"pointer"}}><div style={{display:"flex",justifyContent:"space-between",gap:8}}><strong style={{fontSize:12}}>{l.name}</strong><span className={`score ${l.score>=70?"high":l.score>=40?"medium":"low"}`}>{l.score}</span></div><div className="business-meta">{l.location} · {l.category}</div><div style={{marginTop:9,fontSize:10,color:"var(--muted)"}}><UserRound size={11} style={{verticalAlign:"-2px",marginRight:4}}/>{l.gaps} verified gaps</div><div style={{marginTop:7,fontSize:10,color:"var(--muted)"}}><MessageCircle size={11} style={{verticalAlign:"-2px",marginRight:4}}/>{l.nextAction}</div><select value={l.stage} onClick={e=>e.stopPropagation()} onChange={e=>move(l.id,e.target.value as ProspectStage)} className="select" style={{width:"100%",marginTop:9,fontSize:10}}>{stages.map(s=><option key={s}>{s}</option>)}</select><div className="business-meta" style={{marginTop:7}}><Clock3 size={10} style={{verticalAlign:"-2px",marginRight:4}}/>{formatDate(l.followUpAt)}</div></div>)}</div>)}</div>
    <div className="grid2" style={{marginTop:18}}><div className="card panel"><div className="panel-head"><h2>Next-action queue</h2><CalendarClock size={16} color="var(--muted)"/></div>{leads.filter(l=>l.stage!=="Won"&&l.stage!=="Disqualified").slice(0,6).map(l=><div className="opportunity" key={l.id}><div className="dot"/><div style={{flex:1}}><strong>{l.nextAction}</strong><p>{l.name} · {l.location} · score {l.score}</p></div><span className="badge muted">{l.followUpAt?formatDate(l.followUpAt):l.stage}</span></div>)}</div><div className="card panel"><div className="panel-head"><h2>Outreach guardrails</h2><Target size={16} color="var(--muted)"/></div>{[["Evidence before contact","Use verified evidence and a relevant demo, never a generic blast."],["Human approval","Messaging/calling only activates through a compliant, consent-aware workflow."],["Track outcome","Every contact ends with a next action: follow up, demo, won or disqualified."]].map(([a,b])=><div className="opportunity" key={a}><div className="dot" style={{background:"var(--green)"}}/><div><strong>{a}</strong><p>{b}</p></div></div>)}</div></div>
    {selected && <div className="card panel" style={{marginTop:18}}><div className="panel-head"><div><h2>{selected.name}</h2><div className="panel-note">{selected.location} · {selected.category} · {selected.score}/100 opportunity</div></div><button className="btn" onClick={()=>setSelected(null)}>Close</button></div><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:18}}><div><div className="panel-note">Schedule follow-up</div><div style={{display:"flex",gap:8,marginTop:6}}><input className="search" type="datetime-local" value={followUp} onChange={e=>setFollowUp(e.target.value)}/><button className="btn primary" onClick={saveFollowUp}>Schedule</button></div><div className="panel-note" style={{marginTop:18}}>Add sales note</div><div style={{display:"flex",gap:8,marginTop:6}}><input className="search" value={note} onChange={e=>setNote(e.target.value)} placeholder="e.g. Owner asked for WhatsApp demo"/><button className="btn" onClick={saveNote}><StickyNote size={13}/></button></div></div><div><div className="panel-note">Activity timeline</div><div style={{marginTop:8,display:"grid",gap:7}}>{loadActivities(selected.id).slice(0,8).map(a=><div key={a.id} style={{padding:9,border:"1px solid var(--line)",borderRadius:8}}><strong style={{fontSize:11}}>{a.title}</strong><div className="business-meta">{a.detail||""} · {formatDate(a.createdAt)}</div></div>)}{loadActivities(selected.id).length===0&&<div className="panel-note">No activity yet. Stage changes, notes and follow-ups will appear here.</div>}</div></div></div></div>}
  </main>
}
