"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowRight, CalendarDays, CheckCircle2, ExternalLink, MapPin, MessageCircle, Phone, Search, Sparkles, Star, Utensils, Building2, Scissors, Stethoscope, Wrench, Store, BriefcaseBusiness, GraduationCap, Camera, Plane, Car, Hotel } from "lucide-react";
import { createLead } from "@/lib/businessos";
import type { WorkspaceProspect } from "@/lib/workspace";
import { getBlueprintById, type WebsiteBlueprint } from "@/lib/website-blueprints";

const imageUrl = (source: string) => `/api/prospect-image?src=${encodeURIComponent(source)}`;
const pretty = (value: string) => value.replaceAll("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());

function iconForFamily(family: string) {
  if (family === "food") return Utensils;
  if (family === "real-estate") return Building2;
  if (family === "beauty") return Scissors;
  if (family === "healthcare") return Stethoscope;
  if (family === "services") return Wrench;
  if (family === "retail") return Store;
  if (family === "professional") return BriefcaseBusiness;
  if (family === "education") return GraduationCap;
  if (family === "creative") return Camera;
  if (family === "travel") return Plane;
  if (family === "automotive") return Car;
  if (family === "hospitality") return Hotel;
  return Store;
}

function familyContent(blueprint: WebsiteBlueprint, name: string) {
  const family = blueprint.family;
  if (family === "food") return {
    eyebrow: "LOCAL FOOD EXPERIENCE",
    title: `${name}, made easier to discover.`,
    sub: `A visual-first ${blueprint.name.toLowerCase()} experience built around the business information customers can already discover locally.`,
    cards: ["What customers can discover", "A clearer menu and enquiry path", "Local discovery that leads somewhere"],
    labels: ["Menu & favourites", "Order / enquire", "Visit the business"],
  };
  if (family === "beauty") return {
    eyebrow: "BEAUTY & APPOINTMENTS",
    title: `${name}, designed around the next appointment.`,
    sub: `A polished ${blueprint.name.toLowerCase()} experience that turns local discovery into services, trust and booking conversations.`,
    cards: ["Services customers care about", "A stronger booking journey", "Portfolio-led presentation"],
    labels: ["Explore services", "Book an appointment", "View the work"],
  };
  if (family === "healthcare") return {
    eyebrow: "TRUST-FIRST LOCAL CARE",
    title: `${name}, with a clearer path to care.`,
    sub: `A calm, information-first ${blueprint.name.toLowerCase()} experience focused on verified services, location and appointment enquiries.`,
    cards: ["Understand available care", "Choose the next step", "Find the clinic quickly"],
    labels: ["View services", "Book appointment", "Get directions"],
  };
  if (family === "real-estate") return {
    eyebrow: "LOCAL PROPERTY EXPERIENCE",
    title: `${name}, built for qualified property enquiries.`,
    sub: `A property-focused experience that turns local discovery into property conversations, site visits and follow-up.`,
    cards: ["Explore the property journey", "Qualify the enquiry", "Move toward a site visit"],
    labels: ["Explore properties", "Request a site visit", "Talk to an advisor"],
  };
  if (family === "hospitality") return {
    eyebrow: "STAY & EXPERIENCE",
    title: `${name}, presented like a place worth visiting.`,
    sub: `A visual hospitality experience built around rooms, amenities, availability and the local context customers need before booking.`,
    cards: ["See the experience", "Check availability", "Plan the visit"],
    labels: ["Explore stay", "Check availability", "Get directions"],
  };
  if (family === "automotive") return {
    eyebrow: "AUTOMOTIVE SERVICE",
    title: `${name}, easier to book and easier to trust.`,
    sub: `A service-first automotive experience organized around repairs, maintenance, proof of work and appointment enquiries.`,
    cards: ["Find the right service", "Request a service", "Reach the workshop"],
    labels: ["View services", "Book service", "Call workshop"],
  };
  if (family === "education") return {
    eyebrow: "LEARNING & ADMISSIONS",
    title: `${name}, with a clearer path to enrolment.`,
    sub: `A structured education experience that helps families and learners understand programs, trust signals and the next enquiry step.`,
    cards: ["Explore programs", "Understand the journey", "Start an enquiry"],
    labels: ["View programs", "Enquire now", "Visit location"],
  };
  return {
    eyebrow: `${pretty(family)} BUSINESS EXPERIENCE`,
    title: `${name}, with a better digital front door.`,
    sub: `A purpose-built ${blueprint.name.toLowerCase()} experience assembled from the verified public business context available to SolProvo.`,
    cards: ["Understand the offer", "Take the next step", "Contact the business"],
    labels: [blueprint.primaryCta, blueprint.secondaryCta, "Get directions"],
  };
}

export default function BlueprintWebsite({ prospect }: { prospect: WorkspaceProspect }) {
  const blueprint = getBlueprintById(prospect.blueprintId);
  const Icon = iconForFamily(blueprint.family);
  const content = familyContent(blueprint, prospect.name);
  const [customer, setCustomer] = useState("");
  const [phone, setPhone] = useState("");
  const [need, setNeed] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [extraPhotos, setExtraPhotos] = useState<string[]>([]);

  useEffect(() => {
    if (!prospect.id || prospect.id.startsWith("manual:") || (prospect.mapsPhotoNames || []).length) return;
    fetch(`/api/prospect-photos?placeId=${encodeURIComponent(prospect.id)}`)
      .then((r) => r.ok ? r.json() : { photos: [] })
      .then((d) => setExtraPhotos(Array.isArray(d.photos) ? d.photos : []))
      .catch(() => undefined);
  }, [prospect.id, prospect.mapsPhotoNames]);

  const sources = useMemo(() => [...new Set([...(prospect.imageUrls || []), ...(prospect.mapsPhotoNames || []), ...extraPhotos])].filter(Boolean).slice(0, 9), [prospect.imageUrls, prospect.mapsPhotoNames, extraPhotos]);
  const images = sources.map(imageUrl);
  const hero = images[0];

  function submitLead() {
    setError("");
    if (!customer.trim() || !phone.trim()) { setError("Name and mobile number are required."); return; }
    createLead({ name: customer.trim(), phone: phone.trim(), intent: need.trim() ? `${blueprint.name} enquiry · ${need.trim()}` : `${blueprint.name} enquiry`, channel: "Demo", status: "New", prospectId: prospect.id, businessName: prospect.name, location: prospect.location });
    setSubmitted(true);
  }

  return <div className="bp-site">
    <style>{`
      .bp-site{--ink:#111827;--muted:#667085;--line:#e4e7ec;--brand:#1769e8;--accent:#55c2ff;background:#f7f8fa;color:var(--ink);font-family:DM Sans,system-ui,sans-serif}.bp-site *{box-sizing:border-box}.bp-wrap{max-width:1180px;margin:auto;padding:0 22px}.bp-nav{position:sticky;top:0;z-index:30;background:rgba(255,255,255,.94);backdrop-filter:blur(14px);border-bottom:1px solid var(--line)}.bp-navin{height:70px;display:flex;align-items:center;justify-content:space-between;gap:20px}.bp-brand{display:flex;align-items:center;gap:10px}.bp-logo{width:42px;height:42px;border-radius:13px;display:grid;place-items:center;background:linear-gradient(135deg,var(--accent),var(--brand));color:white;box-shadow:0 10px 25px rgba(23,105,232,.2)}.bp-brand strong{font-size:13px}.bp-brand small{display:block;font-size:9px;color:var(--muted);margin-top:2px}.bp-navlinks{display:flex;gap:17px;align-items:center}.bp-navlinks a{font-size:10px;color:#667085;text-decoration:none}.bp-btn{border:0;display:inline-flex;align-items:center;justify-content:center;gap:7px;padding:12px 15px;border-radius:10px;font-size:11px;font-weight:900;text-decoration:none;cursor:pointer}.bp-primary{background:var(--brand);color:white}.bp-outline{border:1px solid #cfd5dd;color:#344054;background:white}.bp-hero{background:#06152b;color:white;min-height:650px;position:relative;overflow:hidden}.bp-hero:before{content:"";position:absolute;inset:0;background:radial-gradient(circle at 80% 20%,rgba(66,153,225,.28),transparent 36%),radial-gradient(circle at 15% 80%,rgba(23,105,232,.22),transparent 34%)}.bp-heroin{position:relative;display:grid;grid-template-columns:1fr .9fr;gap:65px;align-items:center;padding:78px 0}.bp-kicker{font-size:10px;letter-spacing:.17em;font-weight:900;color:#7dd3fc}.bp-hero h1{font-family:Manrope,system-ui;font-size:clamp(46px,6vw,78px);line-height:.95;letter-spacing:-.065em;margin:16px 0 22px;max-width:760px}.bp-hero h1 span{color:#61c7ff}.bp-hero p{color:#c8d3e2;line-height:1.75;font-size:15px;max-width:640px}.bp-actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:27px}.bp-media{border:1px solid rgba(255,255,255,.18);background:rgba(255,255,255,.08);padding:12px;border-radius:24px;box-shadow:0 35px 90px rgba(0,0,0,.3)}.bp-media img,.bp-media-empty{width:100%;height:430px;border-radius:17px;object-fit:cover;display:block;background:#10233d}.bp-media-empty{display:grid;place-items:center;font-size:80px;font-weight:900;color:#72c9ff}.bp-media-meta{display:flex;justify-content:space-between;padding:11px 4px 2px;font-size:9px;color:#aeb9c9}.bp-media-meta strong{color:#86efac}.bp-section{padding:88px 0}.bp-section.alt{background:#fff}.bp-section.dark{background:#0b1729;color:white}.bp-grid3{display:grid;grid-template-columns:repeat(3,1fr);gap:15px;margin-top:42px}.bp-card{border:1px solid var(--line);background:white;border-radius:19px;padding:25px;min-height:190px}.bp-darkcard{border:1px solid rgba(255,255,255,.1);background:#112039;color:white}.bp-cardicon{width:44px;height:44px;border-radius:13px;background:#eff8ff;color:var(--brand);display:grid;place-items:center}.bp-card h3{font-family:Manrope;margin:17px 0 7px;font-size:17px}.bp-card p{font-size:12px;color:var(--muted);line-height:1.65;margin:0}.bp-darkcard p{color:#aeb9c9}.bp-title{text-align:center;max-width:720px;margin:auto}.bp-eyebrow{font-size:10px;color:var(--brand);font-weight:900;letter-spacing:.16em}.bp-h2{font-family:Manrope;font-size:clamp(34px,4vw,54px);line-height:1.03;letter-spacing:-.05em;margin:12px 0 14px}.bp-copy{font-size:14px;line-height:1.8;color:var(--muted)}.bp-gallery{display:grid;grid-template-columns:1.25fr .75fr .75fr;grid-auto-rows:210px;gap:11px;margin-top:38px}.bp-photo{overflow:hidden;border-radius:17px;background:#15243a}.bp-photo:first-child{grid-row:span 2}.bp-photo img{width:100%;height:100%;object-fit:cover;display:block}.bp-proof{display:grid;grid-template-columns:.85fr 1.15fr;gap:55px;align-items:center}.bp-list{display:grid;gap:11px;margin-top:24px}.bp-listitem{display:flex;gap:10px;align-items:flex-start;border:1px solid var(--line);background:white;border-radius:13px;padding:14px}.bp-listitem strong{font-size:11px}.bp-listitem span{display:block;font-size:10px;color:var(--muted);margin-top:3px}.bp-location{background:#091426;border-radius:24px;min-height:360px;padding:30px;color:white}.bp-location h3{font-family:Manrope;font-size:30px;margin:12px 0}.bp-location p{color:#aeb9c9;line-height:1.7;font-size:13px}.bp-contact{padding:90px 0;background:linear-gradient(135deg,#eff8ff,#fff 55%,#f4f0ff)}.bp-form{max-width:880px;margin:auto;background:white;border:1px solid var(--line);border-radius:24px;padding:34px;box-shadow:0 25px 70px rgba(16,24,40,.08)}.bp-formgrid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:25px}.bp-label{font-size:10px;font-weight:900;color:#475467;display:block;margin-bottom:6px}.bp-input{width:100%;border:1px solid #d0d5dd;border-radius:9px;padding:12px;font-size:12px}.bp-full{grid-column:1/-1}.bp-submit{grid-column:1/-1;border:0;background:var(--brand);color:white;padding:14px;border-radius:10px;font-weight:900;cursor:pointer}.bp-error{grid-column:1/-1;color:#b42318;background:#fff1f0;padding:10px;border-radius:8px;font-size:11px}.bp-success{grid-column:1/-1;color:#027a48;background:#ecfdf3;padding:13px;border-radius:9px;font-size:11px}.bp-footer{background:#06152b;color:#aeb9c9;padding:35px 0}.bp-footerin{display:flex;justify-content:space-between;gap:20px;flex-wrap:wrap;font-size:10px}.bp-footer a{color:#d8e1ee;text-decoration:none}@media(max-width:850px){.bp-navlinks{display:none}.bp-heroin,.bp-proof{grid-template-columns:1fr}.bp-grid3{grid-template-columns:1fr}.bp-gallery{grid-template-columns:1fr 1fr;grid-auto-rows:190px}.bp-photo:first-child{grid-row:span 1}.bp-formgrid{grid-template-columns:1fr}.bp-full,.bp-submit{grid-column:auto}}@media(max-width:560px){.bp-wrap{padding:0 16px}.bp-hero h1{font-size:46px}.bp-section{padding:65px 0}.bp-gallery{grid-template-columns:1fr;grid-auto-rows:240px}.bp-form{padding:23px}}
    `}</style>

    <nav className="bp-nav"><div className="bp-wrap bp-navin"><div className="bp-brand"><div className="bp-logo"><Icon size={19}/></div><div><strong>{prospect.name}</strong><small>{blueprint.name}</small></div></div><div className="bp-navlinks"><a href="#experience">Experience</a><a href="#gallery">Gallery</a><a href="#location">Location</a><a className="bp-btn bp-primary" href="#contact">{blueprint.primaryCta}</a></div></div></nav>

    <section className="bp-hero"><div className="bp-wrap bp-heroin"><div><div className="bp-kicker">{content.eyebrow}</div><h1>{content.title.split(prospect.name)[0]}<span>{prospect.name}</span>{content.title.endsWith(".") ? "." : ""}</h1><p>{content.sub}</p><div className="bp-actions"><a className="bp-btn bp-primary" href="#contact">{blueprint.primaryCta}<ArrowRight size={14}/></a>{prospect.mapsUrl && <a className="bp-btn bp-outline" href={prospect.mapsUrl} target="_blank" rel="noreferrer">Get directions <MapPin size={13}/></a>}</div></div><div className="bp-media">{hero ? <img src={hero} alt={`${prospect.name} preview`} /> : <div className="bp-media-empty"><Icon size={88}/></div>}<div className="bp-media-meta"><span>Personalized local-business concept</span><strong>Live demo</strong></div></div></div></section>

    <section className="bp-section" id="experience"><div className="bp-wrap"><div className="bp-title"><div className="bp-eyebrow">DESIGNED FOR THIS BUSINESS TYPE</div><h2 className="bp-h2">Not a generic template. A {blueprint.name.toLowerCase()} journey.</h2><p className="bp-copy">The demo is organized around the conversion goal that matters most for this type of business: <strong>{blueprint.conversionGoal}</strong>.</p></div><div className="bp-grid3">{content.cards.map((card, i) => <article className="bp-card" key={card}><div className="bp-cardicon">{i===0?<Search size={18}/>:i===1?<CalendarDays size={18}/>:<Sparkles size={18}/>}</div><h3>{card}</h3><p>{content.labels[i]}. Content and claims remain limited to information that can be verified from the business context.</p></article>)}</div></div></section>

    <section className="bp-section alt"><div className="bp-wrap bp-proof"><div><div className="bp-eyebrow">CONVERSION BLUEPRINT</div><h2 className="bp-h2">Every section has a job.</h2><p className="bp-copy">The generator now has a category blueprint with required sections, optional sections, conversion goals, opportunity checks and chatbot intents.</p><div className="bp-list">{blueprint.requiredSections.slice(0,6).map((section)=><div className="bp-listitem" key={section}><CheckCircle2 size={16} color="#12b76a"/><div><strong>{pretty(section)}</strong><span>Required for the {blueprint.name.toLowerCase()} blueprint.</span></div></div>)}</div></div><div className="bp-location"><div className="bp-eyebrow">LOCAL CONTEXT</div><h3>{prospect.location}</h3><p>{prospect.phone ? `Customers can reach ${prospect.name} directly at ${prospect.phone}.` : `The business location is available from the verified Maps context.`}</p><div className="bp-actions"><a className="bp-btn bp-primary" href="#contact">{blueprint.secondaryCta}</a>{prospect.phone && <a className="bp-btn bp-outline" href={`tel:${prospect.phone}`}><Phone size={13}/> Call</a>}</div></div></div></section>

    {images.length > 1 && <section className="bp-section dark" id="gallery"><div className="bp-wrap"><div className="bp-title"><div className="bp-eyebrow">VISUAL STORY</div><h2 className="bp-h2">Show the business, not just the data.</h2><p className="bp-copy">Available public imagery is used as source material for the concept. Production rights and owner approval remain separate from this demo.</p></div><div className="bp-gallery">{images.slice(0,7).map((src,i)=><div className="bp-photo" key={src}><img src={src} alt={`${prospect.name} gallery ${i+1}`} /></div>)}</div></div></section>}

    <section className="bp-section" id="location"><div className="bp-wrap"><div className="bp-title"><div className="bp-eyebrow">FIND THE BUSINESS</div><h2 className="bp-h2">Make local discovery actionable.</h2><p className="bp-copy">Maps, phone and enquiry actions are kept close to the decision point instead of hiding them at the bottom of a generic contact page.</p></div><div className="bp-location" style={{marginTop:38}}><MapPin size={23}/><h3>{prospect.location}</h3><p>{prospect.name} · {blueprint.name}</p><div className="bp-actions">{prospect.mapsUrl && <a className="bp-btn bp-primary" href={prospect.mapsUrl} target="_blank" rel="noreferrer">Open Maps <ExternalLink size={13}/></a>}{prospect.website && <a className="bp-btn bp-outline" href={prospect.website} target="_blank" rel="noreferrer">View current website <ExternalLink size={13}/></a>}</div></div></div></section>

    <section className="bp-contact" id="contact"><div className="bp-wrap"><div className="bp-form"><div className="bp-title"><div className="bp-eyebrow">WORKING ENQUIRY FLOW</div><h2 className="bp-h2">Turn the demo into a conversation.</h2><p className="bp-copy">This form creates a real BusinessOS lead in the workspace. Production messaging and automation remain owner-controlled.</p></div><div className="bp-formgrid"><div><label className="bp-label">Your name</label><input className="bp-input" value={customer} onChange={e=>setCustomer(e.target.value)} placeholder="Full name"/></div><div><label className="bp-label">Mobile number</label><input className="bp-input" value={phone} onChange={e=>setPhone(e.target.value)} placeholder="10-digit mobile number"/></div><div className="bp-full"><label className="bp-label">What do you need?</label><textarea className="bp-input" rows={4} value={need} onChange={e=>setNeed(e.target.value)} placeholder={`Tell ${prospect.name} what you need…`}/></div>{error&&<div className="bp-error">{error}</div>}{submitted?<div className="bp-success"><CheckCircle2 size={14} style={{verticalAlign:"-2px",marginRight:6}}/>Enquiry captured successfully in BusinessOS.</div>:<button className="bp-submit" onClick={submitLead}>{blueprint.primaryCta} <ArrowRight size={14} style={{verticalAlign:"-2px"}}/></button>}</div></div></div></section>

    <footer className="bp-footer"><div className="bp-wrap bp-footerin"><span>Demo generated for {prospect.name}</span><span>Evidence-first · Owner approval required · <a href="#contact">Contact</a></span></div></footer>
  </div>;
}
