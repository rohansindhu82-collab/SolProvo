"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { loadProspects, type WorkspaceProspect } from "@/lib/workspace";
import BlueprintWebsite from "./BlueprintWebsite";

export default function DemoFactoryPage(){
 const [prospect,setProspect]=useState<WorkspaceProspect|null>(null); const [from,setFrom]=useState("");
 useEffect(()=>{const params=new URLSearchParams(window.location.search);const id=params.get("prospect");let origin=params.get("from")||"";if(!origin){try{const raw=localStorage.getItem("solprovo.discovery.v2");const state=raw?JSON.parse(raw):null;if(Array.isArray(state?.places)&&state.places.length)origin="discovery"}catch{}}setFrom(origin);if(id)setProspect(loadProspects().find(p=>p.id===id)||null)},[]);
 const back=from==="discovery"?"/discovery":"/sales";
 return <main style={{minHeight:"100vh",background:"#f6f8fb"}}><header style={{height:64,background:"#fff",borderBottom:"1px solid #e6e9ee",display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 24px",position:"sticky",top:0,zIndex:30}}><Link href={back} style={{color:"#697586",textDecoration:"none",fontSize:12}}><ArrowLeft size={14} style={{verticalAlign:"-2px",marginRight:5}}/>{from==="discovery"?"Back to Discovery":"Back to Sales"}</Link><span style={{fontSize:11,color:"#11875d",fontWeight:700}}><ShieldCheck size={13} style={{verticalAlign:"-2px",marginRight:5}}/>Demo preview · owner approval required</span></header>{prospect?<BlueprintWebsite prospect={prospect}/>:<div style={{padding:60,textAlign:"center",color:"#667085"}}>Prospect not found. Return to Discovery and create the demo again.</div>}</main>
}
