"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CalendarDays, CheckCircle2, MessageCircle, Phone, Search, ShieldCheck, Sparkles, Target } from "lucide-react";
import { loadProspects, type WorkspaceProspect } from "@/lib/workspace";

const sampleProperties = [
  { name: "2 BHK · Greater Noida West", price: "₹48–55 L", tag: "Ready to enquire" },
  { name: "3 BHK · Techzone 4", price: "₹72–84 L", tag: "Popular" },
  { name: "Residential Plot · Noida Extension", price: "₹38–46 L", tag: "New" },
];

export default function DemoFactoryPage() {
  const [budget,setBudget]=useState(60),[submitted,setSubmitted]=useState(false),[prospect,setProspect]=useState<WorkspaceProspect|null>(null);
  useEffect(()=>{const id=new URLSearchParams(window.location.search).get("prospect");if(id)setProspect(loadProspects().find(p=>p.id===id)||null)},[]);
  const matches=useMemo(()=>sampleProperties.filter((_,i)=>budget>=[55,70,46][i]||i===0),[budget]);
  const businessName=prospect?.name||"SolProvo Property Demo";
  const location=prospect?.location||"Greater Noida / Noida Extension";
  const service=prospect?.recommendedService||"Property enquiry + site-visit funnel";

  return <main style={{minHeight:"100vh",background:"#f7f8fa",color:"#17202a",fontFamily:"DM Sans,system-ui"}}>
    <header style={{height:64,background:"#fff",borderBottom:"1px solid #e6e9ee",display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 24px"}}><Link href="/sales" style={{color:"#697586",textDecoration:"none",fontSize:12}}><ArrowLeft size={14} style={{verticalAlign:"-2px",marginRight:5}}/>Back to Sales</Link><span style={{fontSize:11,color:"#11875d",fontWeight:700}}><ShieldCheck size={13} style={{verticalAlign:"-2px",marginRight:5}}/>Personalized demo preview</span></header>
    <section style={{maxWidth:1120,margin:"0 auto",padding:"52px 24px"}}>
      <div style={{textAlign:"center",maxWidth:760,margin:"0 auto 36px"}}><div style={{fontSize:11,fontWeight:800,letterSpacing:".12em",color:"#2558e8"}}>PERSONALIZED DEMO FACTORY</div><h1 style={{fontFamily:"Manrope",fontSize:40,letterSpacing:"-.04em",margin:"10px 0"}}>{businessName}</h1><p style={{color:"#697586",lineHeight:1.6}}>A working sales demo generated from the prospect's verified opportunity context. Production content remains owner-approved.</p>{prospect&&<div style={{display:"inline-flex",gap:8,alignItems:"center",marginTop:10,padding:"7px 10px",borderRadius:999,background:"#eef3ff",color:"#2558e8",fontSize:11}}><Target size={12}/>Recommended: {service} · {prospect.recommendedPackage||"Starter"}</div>}</div>
      <div style={{background:"#101722",color:"#fff",borderRadius:20,padding:28,boxShadow:"0 20px 50px rgba(16,23,34,.15)"}}>
        <div style={{display:"flex",justifyContent:"space-between",gap:20,alignItems:"start"}}><div><div style={{color:"#8e9aaa",fontSize:10,letterSpacing:".12em",fontWeight:800}}>PROPERTY DISCOVERY</div><h2 style={{fontFamily:"Manrope",fontSize:28,margin:"8px 0"}}>Turn enquiries into site visits.</h2><p style={{color:"#aeb8c6",fontSize:12}}>Location: {location}. Customer qualification, enquiry and human handoff are demonstrated before production deployment.</p></div><div style={{background:"#1d2a3c",padding:10,borderRadius:10}}><Sparkles size={18}/></div></div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:18,marginTop:28}}><div style={{background:"#fff",color:"#17202a",borderRadius:14,padding:18}}><label style={{fontSize:11,fontWeight:700}}>Budget up to ₹{budget}L</label><input type="range" min="40" max="100" value={budget} onChange={e=>setBudget(Number(e.target.value))} style={{width:"100%",margin:"16px 0"}}/><div style={{display:"grid",gap:9}}><div style={field}><Search size={14}/>{location}</div><div style={field}>2–3 BHK · Buy</div><button style={{border:0,background:"#2558e8",color:"#fff",padding:12,borderRadius:9,fontWeight:700}}>Show matching properties</button></div></div><div style={{display:"grid",gap:10}}>{matches.map(p=><div key={p.name} style={{background:"#172130",border:"1px solid #2a3748",borderRadius:12,padding:15}}><div style={{display:"flex",justifyContent:"space-between",gap:10}}><strong style={{fontSize:13}}>{p.name}</strong><span style={{color:"#8eb0ff",fontSize:11}}>{p.tag}</span></div><div style={{marginTop:7,color:"#fff",fontWeight:800}}>{p.price}</div><button onClick={()=>setSubmitted(true)} style={{marginTop:12,border:"1px solid #34445a",background:"transparent",color:"#fff",padding:"8px 10px",borderRadius:8,fontSize:11}}>Request site visit</button></div>)}</div></div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14,marginTop:18}}>{[[MessageCircle,"WhatsApp enquiry","Customer can start a conversation from the property result."],[CalendarDays,"Site-visit request","The business gets a structured request instead of an untracked message."],[Phone,"Human handoff","A sales agent can take over when the lead is ready."]].map(([Icon,title,desc])=><div key={String(title)} style={{background:"#fff",border:"1px solid #e6e9ee",borderRadius:14,padding:18}}><div style={{width:34,height:34,borderRadius:9,background:"#eef3ff",display:"grid",placeItems:"center",color:"#2558e8"}}><Icon size={16}/></div><h3 style={{fontFamily:"Manrope",fontSize:14,margin:"12px 0 5px"}}>{String(title)}</h3><p style={{color:"#697586",fontSize:11,lineHeight:1.5}}>{String(desc)}</p></div>)}</div>
      {submitted&&<div style={{marginTop:18,padding:16,borderRadius:12,background:"#e9f8f1",color:"#11875d",fontSize:12}}><CheckCircle2 size={15} style={{verticalAlign:"-3px",marginRight:6}}/>Demo lead captured. In production this becomes a structured lead/site-visit request in BusinessOS.</div>}
      <p style={{marginTop:28,textAlign:"center",color:"#8a95a5",fontSize:10}}>Demo content is illustrative. Production demos will only use business information and inventory that the business has approved for publication.</p>
    </section>
  </main>
}
const field: React.CSSProperties={border:"1px solid #e6e9ee",borderRadius:8,padding:10,fontSize:11,display:"flex",alignItems:"center",gap:7};
