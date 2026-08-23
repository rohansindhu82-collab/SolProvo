"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, ExternalLink, FileText, MapPin, MessageCircle, Phone, ShieldCheck, Sparkles, Target } from "lucide-react";
import { loadProspects, type WorkspaceProspect } from "@/lib/workspace";
import { createLead } from "@/lib/businessos";

export default function DemoFactoryPage() {
  const [prospect,setProspect]=useState<WorkspaceProspect|null>(null);
  const [customer,setCustomer]=useState("");
  const [phone,setPhone]=useState("");
  const [need,setNeed]=useState("");
  const [submitted,setSubmitted]=useState(false);
  const [leadId,setLeadId]=useState("");
  const [error,setError]=useState("");
  const [from,setFrom]=useState("");

  useEffect(()=>{
    const params=new URLSearchParams(window.location.search);
    const id=params.get("prospect");
    setFrom(params.get("from")||"");
    if(id) setProspect(loadProspects().find(p=>p.id===id)||null);
  },[]);

  const category=(prospect?.category||"local business").replaceAll("_"," ");
  const categoryLabel=category.charAt(0).toUpperCase()+category.slice(1);
  const businessName=prospect?.name||"Your Business";
  const location=prospect?.location||"Your local market";
  const hasWebsite=Boolean(prospect?.website);
  const recommended=prospect?.recommendedService||"Lead capture + follow-up";
  const packageName=prospect?.recommendedPackage||"Starter";
  const isRealEstate=category.toLowerCase().includes("real")||category.toLowerCase().includes("property");
  const isAppointment=category.toLowerCase().includes("dental")||category.toLowerCase().includes("doctor")||category.toLowerCase().includes("clinic")||prospect?.demoType==="appointment";
  const primaryAction=isAppointment?"Request an appointment":isRealEstate?"Request property details":"Send an enquiry";
  const intentLabel=isAppointment?"Appointment enquiry":isRealEstate?"Business/property enquiry":"Customer enquiry";
  const contextItems=useMemo(()=>[
    {icon:MapPin,title:"Local presence",value:location,show:Boolean(location)},
    {icon:Phone,title:"Phone",value:prospect?.phone||"Not returned by Maps",show:Boolean(prospect?.phone)},
    {icon:FileText,title:"Website status",value:hasWebsite?"Website available":"No website returned",show:true},
  ],[location,prospect?.phone,hasWebsite]);

  async function submitEnquiry(){
    setError("");
    if(!customer.trim()||!phone.trim()){setError("Please enter your name and mobile number.");return;}
    const lead=createLead({name:customer.trim(),phone:phone.trim(),intent:need.trim()?`${intentLabel} · ${need.trim()}`:intentLabel,channel:"Demo",status:"New",prospectId:prospect?.id,businessName,location});
    setLeadId(lead.id);setSubmitted(true);
  }

  const backHref=from==="discovery"?"/discovery":"/sales";
  const backLabel=from==="discovery"?"Back to Discovery":"Back to Sales";

  return <main style={{minHeight:"100vh",background:"#f7f8fa",color:"#17202a",fontFamily:"DM Sans,system-ui"}}>
    <header style={{height:64,background:"#fff",borderBottom:"1px solid #e6e9ee",display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 24px"}}><Link href={backHref} style={{color:"#697586",textDecoration:"none",fontSize:12}}><ArrowLeft size={14} style={{verticalAlign:"-2px",marginRight:5}}/>{backLabel}</Link><span style={{fontSize:11,color:"#11875d",fontWeight:700}}><ShieldCheck size={13} style={{verticalAlign:"-2px",marginRight:5}}/>Demo preview · owner approval required</span></header>
    <section style={{maxWidth:1120,margin:"0 auto",padding:"46px 24px"}}>
      <div style={{textAlign:"center",maxWidth:820,margin:"0 auto 30px"}}>
        <div style={{fontSize:11,fontWeight:800,letterSpacing:".12em",color:"#2558e8"}}>{hasWebsite?"WEBSITE IMPROVEMENT DEMO":"NEW WEBSITE OPPORTUNITY"}</div>
        <h1 style={{fontFamily:"Manrope",fontSize:40,letterSpacing:"-.04em",margin:"10px 0"}}>{businessName}</h1>
        <p style={{color:"#697586",lineHeight:1.6}}>A sales-ready website concept generated from the business context available in Google Maps. It does not invent products, prices, reviews or claims that were not provided.</p>
        <div style={{display:"inline-flex",gap:8,alignItems:"center",marginTop:10,padding:"7px 10px",borderRadius:999,background:"#eef3ff",color:"#2558e8",fontSize:11}}><Target size={12}/>Recommended: {recommended} · {packageName}</div>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1.15fr .85fr",gap:18,alignItems:"start"}}>
        <div style={{background:"#101722",color:"#fff",borderRadius:20,padding:30,boxShadow:"0 20px 55px rgba(16,23,34,.16)"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"start",gap:20}}><div><div style={{fontSize:10,letterSpacing:".14em",fontWeight:800,color:"#9eb9ff"}}>LOCAL BUSINESS WEBSITE</div><h2 style={{fontFamily:"Manrope",fontSize:31,margin:"9px 0 7px"}}>{businessName}</h2><p style={{color:"#b9c5d5",fontSize:12,lineHeight:1.6,maxWidth:590}}>Turn the business information already discoverable on Maps into a professional digital front door — with enquiries, calls and customer follow-up in one place.</p></div><div style={{background:"rgba(255,255,255,.1)",padding:11,borderRadius:12}}><Sparkles size={20}/></div></div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:10,marginTop:24}}>{contextItems.map(item=>{const Icon=item.icon;return <div key={item.title} style={{background:"#172130",border:"1px solid #2a3748",borderRadius:12,padding:14}}><Icon size={15} style={{color:"#9eb9ff"}}/><div style={{fontSize:10,color:"#8fa0b5",marginTop:8}}>{item.title}</div><strong style={{fontSize:12,display:"block",marginTop:4}}>{item.value}</strong></div>})}</div>
          <div style={{marginTop:16,padding:15,borderRadius:12,background:"#172130",border:"1px solid #2a3748"}}><div style={{fontSize:10,color:"#9eb9ff",fontWeight:800}}>WHY THIS LEAD MATTERS</div><div style={{fontSize:12,lineHeight:1.6,marginTop:6}}>{hasWebsite?"The business already has a website. The demo focuses on a clearer enquiry journey and lead capture rather than claiming the current site is broken.":"No website was returned by Maps. That is a concrete website opportunity: we can show the owner a working concept using the business name, category, location and available contact details."}</div></div>
          <div style={{display:"flex",gap:9,flexWrap:"wrap",marginTop:18}}>{prospect?.mapsUrl&&<a href={prospect.mapsUrl} target="_blank" rel="noreferrer" style={{border:"1px solid #34445a",background:"transparent",color:"#fff",padding:"9px 12px",borderRadius:8,fontSize:11,textDecoration:"none"}}><MapPin size={12} style={{verticalAlign:"-2px",marginRight:5}}/>View Maps listing</a>}{prospect?.website&&<a href={prospect.website} target="_blank" rel="noreferrer" style={{border:"1px solid #34445a",background:"transparent",color:"#fff",padding:"9px 12px",borderRadius:8,fontSize:11,textDecoration:"none"}}><ExternalLink size={12} style={{verticalAlign:"-2px",marginRight:5}}/>View current website</a>}</div>
        </div>

        <div style={{background:"#fff",border:"1px solid #e2e7ed",borderRadius:18,padding:22,boxShadow:"0 12px 35px rgba(23,32,42,.07)"}}>
          <div style={{fontSize:10,fontWeight:800,color:"#2558e8",letterSpacing:".08em"}}>WORKING ENQUIRY FLOW</div>
          <h3 style={{fontFamily:"Manrope",fontSize:21,margin:"7px 0 6px"}}>{primaryAction}</h3>
          <p style={{fontSize:10,color:"#697586",lineHeight:1.5,marginBottom:17}}>This is the part you can demonstrate live to the owner. A real lead is captured into SolProvo BusinessOS when the form is submitted.</p>
          <div style={{display:"grid",gap:9}}><label style={label}>Your name</label><input value={customer} onChange={e=>setCustomer(e.target.value)} placeholder="Full name" style={fieldInput}/><label style={label}>Mobile number</label><input value={phone} onChange={e=>setPhone(e.target.value)} placeholder="10-digit mobile number" inputMode="tel" style={fieldInput}/><label style={label}>{isRealEstate?"What are you looking for?":"What do you need?"}</label><textarea value={need} onChange={e=>setNeed(e.target.value)} placeholder={isRealEstate?"e.g. 2/3 BHK, plot, commercial, budget…":"Tell the business what you need…"} rows={4} style={{...fieldInput,resize:"vertical"}}/>{error&&<div style={{fontSize:10,color:"#b42318",background:"#fff1f0",padding:9,borderRadius:8}}>{error}</div>}<button onClick={submitEnquiry} style={{marginTop:4,border:0,background:"#2558e8",color:"#fff",padding:"12px 14px",borderRadius:9,fontWeight:800,fontSize:12,cursor:"pointer"}}>{primaryAction}</button>{prospect?.phone&&<a href={`tel:${prospect.phone}`} style={{border:"1px solid #dce3ec",background:"#fff",color:"#2558e8",padding:"11px 14px",borderRadius:9,fontWeight:700,fontSize:11,textAlign:"center",textDecoration:"none"}}><Phone size={13} style={{verticalAlign:"-2px",marginRight:5}}/>Call business</a>}<button type="button" style={{border:"1px solid #dce3ec",background:"#fff",color:"#2558e8",padding:"11px 14px",borderRadius:9,fontWeight:700,fontSize:11}}><MessageCircle size={13} style={{verticalAlign:"-2px",marginRight:5}}/>WhatsApp-ready CTA</button></div>
          {submitted&&<div style={{marginTop:13,padding:12,borderRadius:9,background:"#e9f8f1",color:"#11875d",fontSize:11}}><CheckCircle2 size={14} style={{verticalAlign:"-3px",marginRight:5}}/><strong>Lead captured.</strong> BusinessOS reference: {leadId.slice(-8)}</div>}
        </div>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14,marginTop:18}}>{[[Target,"Verified context","Name, category, location and available contact details come from the saved prospect."],[MessageCircle,"Lead capture","The owner can see a working enquiry journey instead of a static screenshot."],[Phone,"Human handoff","Calls and follow-up stay with the business; the demo does not promise automated outcomes it cannot deliver."]].map(([Icon,title,desc])=>{const I=Icon as any;return <div key={String(title)} style={{background:"#fff",border:"1px solid #e6e9ee",borderRadius:14,padding:18}}><div style={{width:34,height:34,borderRadius:9,background:"#eef3ff",display:"grid",placeItems:"center",color:"#2558e8"}}><I size={16}/></div><h3 style={{fontFamily:"Manrope",fontSize:14,margin:"12px 0 5px"}}>{String(title)}</h3><p style={{color:"#697586",fontSize:11,lineHeight:1.5}}>{String(desc)}</p></div>})}</div>
      <p style={{marginTop:28,textAlign:"center",color:"#8a95a5",fontSize:10}}>Demo content is illustrative. Only verified prospect context is used; production website copy, services, offers and contact details require owner approval.</p>
    </section>
  </main>
}

const label:React.CSSProperties={fontSize:10,fontWeight:700,color:"#697586"};
const fieldInput:React.CSSProperties={border:"1px solid #dce4ec",borderRadius:8,padding:10,fontSize:11,width:"100%",boxSizing:"border-box",background:"#fff"};
