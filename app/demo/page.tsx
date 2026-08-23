"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CalendarDays, CheckCircle2, Clock3, MessageCircle, Phone, ShieldCheck, Sparkles, Stethoscope, Target } from "lucide-react";
import { loadProspects, type WorkspaceProspect } from "@/lib/workspace";
import { createAppointment, createLead } from "@/lib/businessos";

const dentalServices = [
  { name: "Dental Check-up", detail: "Routine examination & consultation" },
  { name: "Teeth Cleaning", detail: "Professional cleaning and polishing" },
  { name: "Teeth Whitening", detail: "Smile-brightening consultation" },
  { name: "Root Canal", detail: "Treatment consultation" },
];

const realEstateProperties = [
  { name: "2 BHK · Greater Noida West", price: "₹48–55 L", tag: "Ready to enquire" },
  { name: "3 BHK · Techzone 4", price: "₹72–84 L", tag: "Popular" },
  { name: "Residential Plot · Noida Extension", price: "₹38–46 L", tag: "New" },
];

export default function DemoFactoryPage() {
  const [prospect,setProspect]=useState<WorkspaceProspect|null>(null);
  const [customer,setCustomer]=useState("");
  const [phone,setPhone]=useState("");
  const [service,setService]=useState("");
  const [visitAt,setVisitAt]=useState("");
  const [budget,setBudget]=useState(60);
  const [submitted,setSubmitted]=useState(false);
  const [leadId,setLeadId]=useState("");
  const [error,setError]=useState("");

  useEffect(()=>{
    const id=new URLSearchParams(window.location.search).get("prospect");
    if(id) setProspect(loadProspects().find(p=>p.id===id)||null);
  },[]);

  const isDental = (prospect?.category || "").toLowerCase().includes("dental") || (prospect?.category || "").toLowerCase().includes("clinic");
  const businessName=prospect?.name || (isDental ? "Your Dental Clinic" : "SolProvo Property Demo");
  const location=prospect?.location || (isDental ? "Greater Noida" : "Greater Noida / Noida Extension");
  const recommended=prospect?.recommendedService || (isDental ? "Appointment + enquiry funnel" : "Property enquiry + site-visit funnel");
  const packageName=prospect?.recommendedPackage || "Starter";
  const properties=useMemo(()=>realEstateProperties.filter((_,i)=>budget>=[55,70,46][i]||i===0),[budget]);

  async function submitDental(){
    setError("");
    if(!customer.trim()||!phone.trim()||!service){setError("Please enter your name, phone number and choose a service.");return;}
    const lead=createLead({name:customer.trim(),phone:intlPhone(phone),intent:`Appointment enquiry · ${service}`,channel:"Demo",status:"New",prospectId:prospect?.id,businessName,location});
    const scheduledAt=visitAt?new Date(visitAt).toISOString():new Date(Date.now()+24*60*60*1000).toISOString();
    createAppointment({leadId:lead.id,customerName:lead.name,type:"Dental appointment",scheduledAt,status:"Requested",notes:`${service} · ${businessName}`});
    setLeadId(lead.id);setSubmitted(true);
  }

  function submitProperty(property:string){
    setError("");
    if(!customer.trim()){setError("Please enter your name before requesting a site visit.");return;}
    const lead=createLead({name:customer.trim(),phone:intlPhone(phone),intent:`Site visit request · ${property}`,channel:"Demo",status:"New",prospectId:prospect?.id,businessName,location,budget:`Up to ₹${budget}L`});
    const scheduledAt=visitAt?new Date(visitAt).toISOString():new Date(Date.now()+24*60*60*1000).toISOString();
    createAppointment({leadId:lead.id,customerName:lead.name,type:"Site visit",scheduledAt,status:"Requested",notes:`${property} · ${businessName}`});
    setLeadId(lead.id);setSubmitted(true);
  }

  return <main style={{minHeight:"100vh",background:isDental?"#f8fbfc":"#f7f8fa",color:"#17202a",fontFamily:"DM Sans,system-ui"}}>
    <header style={{height:64,background:"#fff",borderBottom:"1px solid #e6e9ee",display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 24px"}}><Link href="/sales" style={{color:"#697586",textDecoration:"none",fontSize:12}}><ArrowLeft size={14} style={{verticalAlign:"-2px",marginRight:5}}/>Back to Sales</Link><span style={{fontSize:11,color:"#11875d",fontWeight:700}}><ShieldCheck size={13} style={{verticalAlign:"-2px",marginRight:5}}/>Personalized demo preview</span></header>
    <section style={{maxWidth:1120,margin:"0 auto",padding:"46px 24px"}}>
      <div style={{textAlign:"center",maxWidth:760,margin:"0 auto 34px"}}><div style={{fontSize:11,fontWeight:800,letterSpacing:".12em",color:isDental?"#087f8c":"#2558e8"}}>{isDental?"PATIENT EXPERIENCE DEMO":"PERSONALIZED DEMO FACTORY"}</div><h1 style={{fontFamily:"Manrope",fontSize:40,letterSpacing:"-.04em",margin:"10px 0"}}>{businessName}</h1><p style={{color:"#697586",lineHeight:1.6}}>A working customer journey generated from the prospect's verified context. Production content stays owner-approved.</p><div style={{display:"inline-flex",gap:8,alignItems:"center",marginTop:10,padding:"7px 10px",borderRadius:999,background:isDental?"#e8f7f8":"#eef3ff",color:isDental?"#087f8c":"#2558e8",fontSize:11}}><Target size={12}/>Recommended: {recommended} · {packageName}</div></div>

      {isDental ? <div style={{display:"grid",gridTemplateColumns:"1.25fr .75fr",gap:18}}>
        <div style={{background:"linear-gradient(145deg,#073b4c,#0b6671)",color:"#fff",borderRadius:22,padding:34,boxShadow:"0 20px 55px rgba(7,59,76,.18)"}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"start"}}><div><div style={{fontSize:10,letterSpacing:".14em",fontWeight:800,color:"#9fe3e5"}}>PATIENT CARE</div><h2 style={{fontFamily:"Manrope",fontSize:32,margin:"9px 0 7px"}}>A simpler way to book your visit.</h2><p style={{color:"#c5e3e5",fontSize:12,lineHeight:1.6,maxWidth:550}}>Give patients a clear path from service selection to appointment request, with a human handoff when needed.</p></div><div style={{background:"rgba(255,255,255,.12)",padding:11,borderRadius:12}}><Stethoscope size={20}/></div></div><div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:10,marginTop:28}}>{dentalServices.map(item=><button key={item.name} onClick={()=>setService(item.name)} style={{textAlign:"left",background:service===item.name?"#fff":"rgba(255,255,255,.08)",color:service===item.name?"#17202a":"#fff",border:"1px solid rgba(255,255,255,.16)",borderRadius:13,padding:15,cursor:"pointer"}}><strong style={{fontSize:12}}>{item.name}</strong><div style={{fontSize:10,marginTop:5,opacity:.72}}>{item.detail}</div></button>)}</div><div style={{marginTop:22,padding:15,borderRadius:13,background:"rgba(255,255,255,.08)",fontSize:11,color:"#d9eff0"}}>✓ Appointment request · ✓ Service selection · ✓ Phone capture · ✓ Human confirmation</div></div>
        <div style={{background:"#fff",border:"1px solid #e2eaec",borderRadius:18,padding:22,boxShadow:"0 12px 35px rgba(7,59,76,.07)"}}><div style={{fontSize:10,fontWeight:800,color:"#087f8c",letterSpacing:".08em"}}>BOOK AN APPOINTMENT</div><h3 style={{fontFamily:"Manrope",fontSize:21,margin:"7px 0 18px"}}>{service||"Choose a service"}</h3><div style={{display:"grid",gap:9}}><label style={label}>Your name</label><input value={customer} onChange={e=>setCustomer(e.target.value)} placeholder="Full name" style={fieldInput}/><label style={label}>Mobile number</label><input value={phone} onChange={e=>setPhone(e.target.value)} placeholder="10-digit mobile number" inputMode="tel" style={fieldInput}/><label style={label}>Preferred time</label><input type="datetime-local" value={visitAt} onChange={e=>setVisitAt(e.target.value)} style={fieldInput}/>{error&&<div style={{fontSize:10,color:"#b42318",background:"#fff1f0",padding:9,borderRadius:8}}>{error}</div>}<button onClick={submitDental} style={{marginTop:4,border:0,background:"#087f8c",color:"#fff",padding:"12px 14px",borderRadius:9,fontWeight:800,fontSize:12,cursor:"pointer"}}>Request appointment</button><button style={{border:"1px solid #d7e2e4",background:"#fff",color:"#087f8c",padding:"11px 14px",borderRadius:9,fontWeight:700,fontSize:11}}><MessageCircle size={13} style={{verticalAlign:"-2px",marginRight:5}}/>Chat on WhatsApp</button><div style={{fontSize:9,color:"#8a95a5",lineHeight:1.5}}>Demo request only. The clinic confirms the final appointment.</div></div></div>
      </div> : <div style={{background:"#101722",color:"#fff",borderRadius:20,padding:28}}><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:18}}><div style={{background:"#fff",color:"#17202a",borderRadius:14,padding:18}}><label style={label}>Budget up to ₹{budget}L</label><input type="range" min="40" max="100" value={budget} onChange={e=>setBudget(Number(e.target.value))} style={{width:"100%",margin:"16px 0"}}/><input value={customer} onChange={e=>setCustomer(e.target.value)} placeholder="Your name" style={fieldInput}/><input value={phone} onChange={e=>setPhone(e.target.value)} placeholder="Mobile number" style={{...fieldInput,marginTop:9}}/><input type="datetime-local" value={visitAt} onChange={e=>setVisitAt(e.target.value)} style={{...fieldInput,marginTop:9}}/></div><div style={{display:"grid",gap:10}}>{properties.map(p=><div key={p.name} style={{background:"#172130",border:"1px solid #2a3748",borderRadius:12,padding:15}}><strong style={{fontSize:13}}>{p.name}</strong><div style={{marginTop:7,fontWeight:800}}>{p.price}</div><button onClick={()=>submitProperty(p.name)} style={{marginTop:12,border:"1px solid #34445a",background:"transparent",color:"#fff",padding:"8px 10px",borderRadius:8,fontSize:11}}>Request site visit</button></div>)}</div></div></div>}

      {submitted&&<div style={{marginTop:18,padding:17,borderRadius:12,background:"#e9f8f1",color:"#11875d",fontSize:12}}><CheckCircle2 size={15} style={{verticalAlign:"-3px",marginRight:6}}/><strong>Request captured.</strong> BusinessOS received the lead and appointment request. Reference: {leadId.slice(-8)}</div>}
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14,marginTop:18}}>{[[CalendarDays,"Appointment flow","Customer selects a service and requests a preferred time."],[MessageCircle,"WhatsApp-ready","A direct conversation CTA can be connected to the business number."],[Phone,"Human handoff","The business confirms the request instead of relying on an automated promise."]].map(([Icon,title,desc])=><div key={String(title)} style={{background:"#fff",border:"1px solid #e6e9ee",borderRadius:14,padding:18}}><div style={{width:34,height:34,borderRadius:9,background:isDental?"#e8f7f8":"#eef3ff",display:"grid",placeItems:"center",color:isDental?"#087f8c":"#2558e8"}}><Icon size={16}/></div><h3 style={{fontFamily:"Manrope",fontSize:14,margin:"12px 0 5px"}}>{String(title)}</h3><p style={{color:"#697586",fontSize:11,lineHeight:1.5}}>{String(desc)}</p></div>)}</div>
      <p style={{marginTop:28,textAlign:"center",color:"#8a95a5",fontSize:10}}>Demo content is illustrative. Production demos use only business information, services and contact details approved for publication.</p>
    </section>
  </main>
}

function intlPhone(value:string){return value.trim();}
const label:React.CSSProperties={fontSize:10,fontWeight:700,color:"#697586"};
const fieldInput:React.CSSProperties={border:"1px solid #dce4e6",borderRadius:8,padding:10,fontSize:11,width:"100%",boxSizing:"border-box",background:"#fff"};
