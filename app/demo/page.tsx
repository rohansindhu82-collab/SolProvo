"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, Loader2 } from "lucide-react";
import { loadProspects, upsertProspect, type WorkspaceProspect } from "@/lib/workspace";
import { getWebsiteBlueprint } from "@/lib/website-blueprints";
import BlueprintWebsite from "./BlueprintWebsite";

export default function DemoFactoryPage(){
 const [prospect,setProspect]=useState<WorkspaceProspect|null>(null); const [from,setFrom]=useState(""); const [enriching,setEnriching]=useState(false);
 useEffect(()=>{
   const params=new URLSearchParams(window.location.search); const id=params.get("prospect"); let origin=params.get("from")||"";
   if(!origin){try{const raw=localStorage.getItem("solprovo.discovery.v2");const state=raw?JSON.parse(raw):null;if(Array.isArray(state?.places)&&state.places.length)origin="discovery"}catch{}}
   setFrom(origin);
   const found=id?loadProspects().find(p=>p.id===id)||null:null; setProspect(found);
   if(found){
     setEnriching(true);
     fetch("/api/intelligence",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({placeId:found.id,name:found.name,category:found.category,address:found.location,website:found.website,mapsUrl:found.mapsUrl,phone:found.phone,photoNames:found.mapsPhotoNames||[],imageUrls:found.imageUrls||[]})})
       .then(r=>r.ok?r.json():null).then(data=>{const intel=data?.intelligence;if(!intel)return;const next={...found,intelligence:intel,rating:intel.maps?.rating||found.rating,reviewCount:intel.maps?.reviewCount||found.reviewCount,hours:intel.maps?.hours||found.hours,reviews:intel.reviews||found.reviews,imageUrls:[...(found.imageUrls||[]),...(intel.website?.images||[])],mapsPhotoNames:[...(found.mapsPhotoNames||[]),...(intel.maps?.photos||[])]};upsertProspect(next);setProspect(next)}).catch(()=>undefined).finally(()=>setEnriching(false));
   }
 },[]);
 const back=from==="discovery"?"/discovery":"/sales";
 const resolvedProspect=prospect?{...prospect,blueprintId:prospect.blueprintId||getWebsiteBlueprint(prospect.category).id}:null;
 return <main style={{minHeight:"100vh",background:"#f6f8fb"}}><header style={{height:64,background:"#fff",borderBottom:"1px solid #e6e9ee",display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 24px",position:"sticky",top:0,zIndex:30}}><Link href={back} style={{color:"#697586",textDecoration:"none",fontSize:12}}><ArrowLeft size={14} style={{verticalAlign:"-2px",marginRight:5}}/>{from==="discovery"?"Back to Discovery":"Back to Sales"}</Link><span style={{fontSize:11,color:"#11875d",fontWeight:700}}>{enriching&&<><Loader2 size={13} className="spin" style={{verticalAlign:"-2px",marginRight:5}}/>Building verified business intelligence…</>} {!enriching&&<><ShieldCheck size={13} style={{verticalAlign:"-2px",marginRight:5}}/>Demo preview · owner approval required</>}</span></header>{resolvedProspect?<BlueprintWebsite prospect={resolvedProspect}/>:<div style={{padding:60,textAlign:"center",color:"#667085"}}>Prospect not found. Return to Discovery and create the demo again.</div>}</main>
}
