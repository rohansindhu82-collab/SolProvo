"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  ExternalLink,
  MapPin,
  MessageCircle,
  Phone,
  Scissors,
  Sparkles,
  Store,
  Stethoscope,
  Utensils,
  Wrench,
} from "lucide-react";
import { createLead } from "@/lib/businessos";
import type { WorkspaceProspect } from "@/lib/workspace";

const pretty = (value: string) => value.replaceAll("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());
const isFood = (value: string) => /food|restaurant|cafe|coffee|bakery|bistro|kitchen|meal|catering|sweet|dessert|dhaba|tiffin|seafood/i.test(value);
const isRealEstate = (value: string) => /real estate|property|estate|builder|developer|realtor|housing|apartment/i.test(value);
const isDental = (value: string) => /dental|dentist|clinic|doctor|health/i.test(value);
const isBeauty = (value: string) => /salon|spa|beauty|barber|parlour|hair/i.test(value);
const isHome = (value: string) => /plumb|electric|repair|cleaning|interior|furniture|home service|contractor/i.test(value);
const iconFor = (value: string) => isFood(value) ? Utensils : isRealEstate(value) ? Building2 : isDental(value) ? Stethoscope : isBeauty(value) ? Scissors : isHome(value) ? Wrench : Store;
const imageUrl = (source: string) => `/api/prospect-image?src=${encodeURIComponent(source)}`;

export default function ProspectWebsite({ prospect }: { prospect: WorkspaceProspect | null }) {
  const [customer, setCustomer] = useState("");
  const [phone, setPhone] = useState("");
  const [need, setNeed] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [leadId, setLeadId] = useState("");
  const [error, setError] = useState("");
  const [extraPhotos, setExtraPhotos] = useState<string[]>([]);
  const [failed, setFailed] = useState<Record<string, boolean>>({});

  const name = prospect?.name || "Your Business";
  const category = prospect?.category || "local business";
  const location = prospect?.location || "Your local market";
  const food = isFood(category);
  const realEstate = isRealEstate(category);
  const dental = isDental(category);
  const beauty = isBeauty(category);
  const home = isHome(category);
  const hasWebsite = Boolean(prospect?.website);
  const Icon = iconFor(category);

  useEffect(() => {
    if (!prospect?.id || prospect.id.startsWith("manual:") || (prospect.mapsPhotoNames || []).length) return;
    fetch(`/api/prospect-photos?placeId=${encodeURIComponent(prospect.id)}`)
      .then((response) => response.ok ? response.json() : { photos: [] })
      .then((data) => setExtraPhotos(Array.isArray(data.photos) ? data.photos : []))
      .catch(() => undefined);
  }, [prospect?.id, prospect?.mapsPhotoNames]);

  const sources = useMemo(() => {
    const all = [
      ...(prospect?.imageUrls || []),
      ...(prospect?.mapsPhotoNames || []),
      ...extraPhotos,
    ];
    return [...new Set(all)].filter(Boolean).slice(0, 10);
  }, [prospect?.imageUrls, prospect?.mapsPhotoNames, extraPhotos]);

  const images = sources
    .map((source) => imageUrl(source))
    .filter((source) => !failed[source]);
  const hero = images[0];
  const gallery = images.slice(0, 7);

  const action = dental
    ? "Request an appointment"
    : realEstate
      ? "Request property details"
      : food
        ? "Send a food enquiry"
        : beauty
          ? "Book an enquiry"
          : home
            ? "Request a service"
            : "Send an enquiry";

  const heroTitle = food
    ? <>A place for good food, made easier to <span>discover.</span></>
    : realEstate
      ? <>A better way to <span>discover your next property.</span></>
      : dental
        ? <>A calmer, clearer way to <span>start your care journey.</span></>
        : beauty
          ? <>A beautiful digital front door for <span>your next visit.</span></>
          : home
            ? <>Make your local service <span>easier to find and contact.</span></>
            : <>A better digital front door for <span>{name}.</span></>;

  const heroSub = food
    ? "A visual-first local food experience built around the business presence customers can already discover."
    : realEstate
      ? "A property-focused experience designed to move local visitors from discovery to enquiry without inventing listings."
      : dental
        ? "A trust-first local experience designed to make the next step simple, clear and reassuring."
        : beauty
          ? "A polished local experience designed to turn discovery into an enquiry or booking conversation."
          : home
            ? "A practical local-business experience designed to make services easier to discover and contact."
            : "A polished local-business experience built from the public business context already available.";

  function submit() {
    setError("");
    if (!customer.trim() || !phone.trim()) {
      setError("Please enter your name and mobile number.");
      return;
    }
    const label = dental ? "Appointment" : realEstate ? "Property" : food ? "Food" : beauty ? "Booking" : home ? "Service" : "Customer";
    const lead = createLead({
      name: customer.trim(),
      phone: phone.trim(),
      intent: need.trim() ? `${label} enquiry · ${need.trim()}` : `${label} enquiry`,
      channel: "Demo",
      status: "New",
      prospectId: prospect?.id,
      businessName: name,
      location,
    });
    setLeadId(lead.id);
    setSubmitted(true);
  }

  return (
    <div className="prospect-site">
      <style>{`
        .prospect-site{--ink:#111827;--muted:#667085;--line:#e4e7ec;--brand:#175cd3;--brand2:#2e90fa;background:#f7f8fa;color:var(--ink);font-family:DM Sans,system-ui,sans-serif;overflow:hidden}.prospect-site *{box-sizing:border-box}.ps-wrap{max-width:1180px;margin:auto;padding:0 22px}.ps-nav{position:sticky;top:0;z-index:40;background:rgba(255,255,255,.94);backdrop-filter:blur(16px);border-bottom:1px solid var(--line)}.ps-nav-inner{height:72px;display:flex;align-items:center;justify-content:space-between;gap:20px}.ps-brand{display:flex;align-items:center;gap:10px;text-decoration:none;color:var(--ink);min-width:0}.ps-logo{width:42px;height:42px;border-radius:13px;display:grid;place-items:center;background:linear-gradient(135deg,var(--brand2),var(--brand));color:#fff;box-shadow:0 9px 24px rgba(23,92,211,.22);flex:none}.ps-brand strong{font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.ps-brand small{display:block;color:var(--muted);font-size:9px;margin-top:2px}.ps-links{display:flex;align-items:center;gap:17px}.ps-links a{font-size:10px;color:#667085;text-decoration:none}.ps-cta{background:var(--brand)!important;color:#fff!important;padding:10px 13px;border-radius:9px;font-weight:900}.ps-hero{position:relative;background:#071426;color:#fff;min-height:680px;display:flex;align-items:center}.ps-hero-bg{position:absolute;inset:0;background:linear-gradient(90deg,rgba(4,13,27,.98),rgba(4,13,27,.76) 48%,rgba(4,13,27,.28))}.ps-hero-bg.has-image{background-image:linear-gradient(90deg,rgba(4,13,27,.97),rgba(4,13,27,.76) 45%,rgba(4,13,27,.25)),var(--hero-image);background-size:cover;background-position:center}.ps-hero-grid{position:relative;display:grid;grid-template-columns:1fr .88fr;gap:60px;align-items:center;padding:76px 0 82px}.ps-kicker{font-size:10px;letter-spacing:.17em;font-weight:900;color:#8ac8ff;text-transform:uppercase}.ps-hero h1{font-family:Manrope,system-ui;font-size:clamp(44px,6vw,76px);line-height:.96;letter-spacing:-.06em;margin:17px 0 22px;max-width:760px}.ps-hero h1 span{color:#63c5ff}.ps-hero p{font-size:16px;line-height:1.75;color:#d0d5dd;max-width:650px}.ps-actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:28px}.ps-button{display:inline-flex;align-items:center;justify-content:center;gap:7px;padding:13px 16px;border-radius:10px;text-decoration:none;font-size:11px;font-weight:900}.ps-button.primary{background:#1769e8;color:#fff}.ps-button.ghost{border:1px solid rgba(255,255,255,.25);color:#fff;background:rgba(255,255,255,.04)}.ps-hero-card{border:1px solid rgba(255,255,255,.18);background:rgba(255,255,255,.09);padding:12px;border-radius:24px;box-shadow:0 30px 90px rgba(0,0,0,.25);backdrop-filter:blur(10px)}.ps-hero-img,.ps-placeholder{height:410px;width:100%;object-fit:cover;border-radius:17px;display:block;background:#15243a}.ps-placeholder{display:grid;place-items:center;background:radial-gradient(circle at 30% 20%,#24446c,#0d1b2f 62%);font-size:80px;font-weight:900;color:#8ac8ff}.ps-card-meta{display:flex;justify-content:space-between;gap:12px;padding:12px 5px 2px;font-size:10px;color:#cbd5e1}.ps-card-meta strong{color:#86efac}.ps-section{padding:88px 0}.ps-section.alt{background:#f8fafc}.ps-section.dark{background:#0d1727;color:#fff}.ps-two{display:grid;grid-template-columns:.85fr 1.15fr;gap:70px;align-items:start}.ps-eyebrow{font-size:10px;color:var(--brand);font-weight:900;letter-spacing:.16em}.dark .ps-eyebrow{color:#8ac8ff}.ps-h2{font-family:Manrope,system-ui;font-size:clamp(34px,4.5vw,54px);line-height:1.02;letter-spacing:-.05em;margin:12px 0 18px}.ps-copy{font-size:15px;line-height:1.8;color:var(--muted);margin:0}.dark .ps-copy{color:#aeb9c9}.ps-facts{display:grid;grid-template-columns:repeat(2,1fr);gap:12px;margin-top:28px}.ps-fact{border:1px solid var(--line);border-radius:15px;padding:17px;background:#fff}.ps-fact small{display:block;font-size:9px;color:var(--muted);margin:10px 0 4px}.ps-fact strong{font-size:12px;line-height:1.45}.ps-story-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-top:42px}.ps-story{background:#fff;border:1px solid var(--line);border-radius:19px;padding:24px;min-height:190px}.ps-story-icon{width:44px;height:44px;border-radius:12px;background:#eff8ff;display:grid;place-items:center;color:var(--brand)}.ps-story h3{font-family:Manrope;font-size:17px;margin:17px 0 7px}.ps-story p{font-size:12px;line-height:1.65;color:var(--muted);margin:0}.ps-gallery-head{display:flex;justify-content:space-between;align-items:end;gap:30px}.ps-gallery{display:grid;grid-template-columns:1.3fr .7fr .7fr;grid-auto-rows:210px;gap:11px;margin-top:34px}.ps-photo{overflow:hidden;border-radius:17px;background:#17243a;border:1px solid rgba(255,255,255,.08);position:relative}.ps-photo:first-child{grid-row:span 2}.ps-photo img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .5s ease}.ps-photo:hover img{transform:scale(1.035)}.ps-photo-label{position:absolute;left:12px;bottom:12px;background:rgba(0,0,0,.56);backdrop-filter:blur(8px);padding:6px 8px;border-radius:7px;font-size:9px;color:#fff}.ps-visit{display:grid;grid-template-columns:1.05fr .95fr;gap:30px;align-items:stretch}.ps-map-card{min-height:410px;border-radius:24px;overflow:hidden;background:#0b1220}.ps-map-card img{width:100%;height:100%;object-fit:cover;display:block}.ps-map-empty{min-height:410px;display:grid;place-items:center;color:#8ac8ff}.ps-location{padding:30px 8px}.ps-location-actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:25px}.ps-enquiry{background:linear-gradient(135deg,#edf7ff,#fff 55%,#f5f2ff)}.ps-form{max-width:900px;margin:auto;background:#fff;border:1px solid var(--line);border-radius:25px;padding:35px;box-shadow:0 24px 70px rgba(16,24,40,.08)}.ps-form-head{text-align:center;max-width:680px;margin:0 auto 28px}.ps-form-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}.ps-field{width:100%;border:1px solid #d0d5dd;border-radius:9px;padding:12px;font-size:12px;background:#fff}.ps-label{display:block;font-size:10px;font-weight:800;color:#475467;margin-bottom:6px}.ps-full{grid-column:1/-1}.ps-submit{grid-column:1/-1;border:0;background:var(--brand);color:#fff;padding:14px;border-radius:10px;font-weight:900;cursor:pointer}.ps-success{margin-top:13px;padding:13px;border-radius:10px;background:#ecfdf3;color:#027a48;font-size:11px}.ps-error{grid-column:1/-1;background:#fff1f0;color:#b42318;padding:10px;border-radius:8px;font-size:11px}.ps-footer{background:#071426;color:#98a2b3;padding:34px 0}.ps-footer-inner{display:flex;justify-content:space-between;align-items:center;gap:20px;flex-wrap:wrap}.ps-footer-brand{display:flex;gap:10px;align-items:center}.ps-footer-logo{width:36px;height:36px;border-radius:10px;background:#175cd3;color:#fff;display:grid;place-items:center}.ps-disclaimer{font-size:9px;max-width:520px;line-height:1.5;text-align:right}@media(max-width:850px){.ps-links{display:none}.ps-hero-grid,.ps-two,.ps-visit{grid-template-columns:1fr}.ps-hero{min-height:auto}.ps-hero-grid{padding-top:55px}.ps-gallery{grid-template-columns:1fr 1fr;grid-auto-rows:190px}.ps-photo:first-child{grid-row:span 1}.ps-story-grid{grid-template-columns:1fr}.ps-gallery-head{display:block}.ps-disclaimer{text-align:left}.ps-form-grid{grid-template-columns:1fr}.ps-full,.ps-submit{grid-column:auto}}@media(max-width:560px){.ps-wrap{padding:0 16px}.ps-hero h1{font-size:45px}.ps-section{padding:65px 0}.ps-facts{grid-template-columns:1fr}.ps-gallery{grid-template-columns:1fr;grid-auto-rows:240px}.ps-form{padding:23px}.ps-hero-img,.ps-placeholder{height:300px}}
      `}</style>

      <nav className="ps-nav">
        <div className="ps-wrap ps-nav-inner">
          <a className="ps-brand" href="#home">
            <div className="ps-logo"><Icon size={19} /></div>
            <div><strong>{name}</strong><small>{pretty(category)} · {location}</small></div>
          </a>
          <div className="ps-links">
            <a href="#home">Home</a>
            <a href="#story">{food ? "Story" : "About"}</a>
            <a href="#experience">{food ? "Food & Atmosphere" : realEstate ? "Experience" : "Highlights"}</a>
            <a href="#gallery">Gallery</a>
            <a href="#location">{food ? "Visit" : "Location"}</a>
            <a className="ps-cta" href="#enquiry">{action}</a>
          </div>
        </div>
      </nav>

      <section id="home" className="ps-hero">
        <div className={`ps-hero-bg${hero ? " has-image" : ""}`} style={hero ? ({ "--hero-image": `url(${hero})` } as React.CSSProperties) : undefined} />
        <div className="ps-wrap ps-hero-grid">
          <div>
            <div className="ps-kicker">{pretty(category)} · {location}</div>
            <h1>{heroTitle}</h1>
            <p>{heroSub}</p>
            <div className="ps-actions">
              <a className="ps-button primary" href="#enquiry">{action}<ArrowRight size={14} /></a>
              {prospect?.mapsUrl && <a className="ps-button ghost" href={prospect.mapsUrl} target="_blank" rel="noreferrer"><MapPin size={14} /> Find us</a>}
            </div>
          </div>
          <div className="ps-hero-card">
            {hero ? <img className="ps-hero-img" src={hero} alt={`${name} public visual`} onError={() => setFailed((value) => ({ ...value, [hero]: true }))} /> : <div className="ps-placeholder"><Icon size={90} /></div>}
            <div className="ps-card-meta"><span>{hasWebsite ? "Website improvement concept" : "New website opportunity"}</span><strong>Live demo</strong></div>
          </div>
        </div>
      </section>

      <section id="story" className="ps-section">
        <div className="ps-wrap ps-two">
          <div><div className="ps-eyebrow">{food ? "THE BUSINESS" : "ABOUT THE BUSINESS"}</div><h2 className="ps-h2">Turn local discovery into a real customer experience.</h2></div>
          <div>
            <p className="ps-copy">This demo uses the business information already returned from public discovery. Facts are presented naturally through the website rather than dumped into a prospect report.</p>
            <div className="ps-facts">
              <div className="ps-fact"><MapPin size={17} /><small>Local presence</small><strong>{location}</strong></div>
              <div className="ps-fact"><Phone size={17} /><small>Direct contact</small><strong>{prospect?.phone || "Contact path not returned"}</strong></div>
              <div className="ps-fact"><Store size={17} /><small>Website status</small><strong>{hasWebsite ? "Existing website" : "No website returned"}</strong></div>
              <div className="ps-fact"><Sparkles size={17} /><small>Demo opportunity</small><strong>{prospect?.recommendedService || "Website + lead capture"}</strong></div>
            </div>
          </div>
        </div>
      </section>

      <section id="experience" className="ps-section alt">
        <div className="ps-wrap">
          <div style={{ maxWidth: 720 }}><div className="ps-eyebrow">{food ? "FOOD & ATMOSPHERE" : "THE EXPERIENCE"}</div><h2 className="ps-h2">{food ? "Make the food the hero." : realEstate ? "Give visitors a reason to enquire." : dental ? "Build trust before the first call." : beauty ? "Show the experience before the visit." : "Give the business a proper digital front door."}</h2><p className="ps-copy">{food ? "A visual-first section gives customers a feel for the place before they decide to contact, visit or order." : "The layout changes with the business category so the owner can see a believable website, not a generic template."}</p></div>
          <div className="ps-story-grid">
            <div className="ps-story"><div className="ps-story-icon"><Sparkles size={20} /></div><h3>Premium first impression</h3><p>Clear brand treatment, strong hierarchy and an immediate primary action.</p></div>
            <div className="ps-story"><div className="ps-story-icon"><MessageCircle size={20} /></div><h3>Customer action</h3><p>A working enquiry path captures a real demo lead into BusinessOS.</p></div>
            <div className="ps-story"><div className="ps-story-icon"><MapPin size={20} /></div><h3>Local trust</h3><p>Location, Maps and contact context remain easy to find without overwhelming the visitor.</p></div>
          </div>
        </div>
      </section>

      <section id="gallery" className="ps-section dark">
        <div className="ps-wrap">
          <div className="ps-gallery-head"><div><div className="ps-eyebrow">VISUAL STORY</div><h2 className="ps-h2" style={{ marginBottom: 0 }}>Use the business's real visual presence.</h2></div><p className="ps-copy" style={{ maxWidth: 360 }}>Website images are used when available. Google Maps photos are pulled server-side when available.</p></div>
          {gallery.length > 0 ? <div className="ps-gallery">{gallery.map((src, index) => <div className="ps-photo" key={src}><img src={src} alt={`${name} visual ${index + 1}`} onError={() => setFailed((value) => ({ ...value, [src]: true }))} /><div className="ps-photo-label">{index === 0 ? "Featured visual" : "Public visual context"}</div></div>)}</div> : <div style={{ marginTop: 34, border: "1px dashed #475467", borderRadius: 17, padding: 60, textAlign: "center", color: "#98a2b3" }}><Icon size={42} /><div style={{ marginTop: 12 }}>No usable public images were returned.</div><small style={{ display: "block", marginTop: 7 }}>The visual layout is ready for owner-approved photography.</small></div>}
        </div>
      </section>

      <section id="location" className="ps-section">
        <div className="ps-wrap ps-visit">
          <div className="ps-map-card">{gallery[1] || hero ? <img src={gallery[1] || hero} alt={`${name} local visual`} /> : <div className="ps-map-empty"><MapPin size={82} /></div>}</div>
          <div className="ps-location"><div className="ps-eyebrow">FIND & CONNECT</div><h2 className="ps-h2">Local, visible and easy to reach.</h2><p className="ps-copy">{location}</p>{prospect?.phone && <p style={{ fontWeight: 900, fontSize: 14, marginTop: 20 }}><Phone size={15} color="#175cd3" style={{ verticalAlign: "-2px", marginRight: 7 }} />{prospect.phone}</p>}<div className="ps-location-actions">{prospect?.mapsUrl && <a className="ps-button primary" href={prospect.mapsUrl} target="_blank" rel="noreferrer"><MapPin size={13} />Open Google Maps</a>}{hasWebsite && prospect?.website && <a className="ps-button" style={{ border: "1px solid #d0d5dd", color: "#344054" }} href={prospect.website} target="_blank" rel="noreferrer"><ExternalLink size={13} />Current website</a>}</div></div>
        </div>
      </section>

      <section id="enquiry" className="ps-section ps-enquiry">
        <div className="ps-wrap"><div className="ps-form"><div className="ps-form-head"><div className="ps-eyebrow">START A CONVERSATION</div><h2 className="ps-h2">{action}</h2><p className="ps-copy">This is a working sales demo. A submitted enquiry is captured into SolProvo BusinessOS.</p></div><div className="ps-form-grid"><div><label className="ps-label">Your name</label><input className="ps-field" value={customer} onChange={(event) => setCustomer(event.target.value)} placeholder="Full name" /></div><div><label className="ps-label">Mobile number</label><input className="ps-field" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="10-digit mobile number" inputMode="tel" /></div><div className="ps-full"><label className="ps-label">{realEstate ? "What are you looking for?" : food ? "What would you like to ask about?" : "What do you need?"}</label><textarea className="ps-field" rows={5} value={need} onChange={(event) => setNeed(event.target.value)} placeholder="Tell the business what you need..." style={{ resize: "vertical" }} /></div>{error && <div className="ps-error">{error}</div>}<button className="ps-submit" onClick={submit}>{action}</button></div>{submitted && <div className="ps-success"><CheckCircle2 size={14} style={{ verticalAlign: "-3px", marginRight: 5 }} /><strong>Lead captured.</strong> BusinessOS reference: {leadId.slice(-8)}</div>}{prospect?.phone && <div style={{ display: "flex", gap: 9, marginTop: 12 }}><a className="ps-button" style={{ flex: 1, border: "1px solid #d0d5dd", color: "#175cd3" }} href={`tel:${prospect.phone}`}><Phone size={13} />Call business</a><button className="ps-button" style={{ flex: 1, border: "1px solid #d0d5dd", color: "#175cd3", background: "#fff", cursor: "pointer" }}><MessageCircle size={13} />WhatsApp-ready CTA</button></div>}</div></div>
      </section>

      <footer className="ps-footer"><div className="ps-wrap ps-footer-inner"><div className="ps-footer-brand"><div className="ps-footer-logo"><Icon size={16} /></div><div><strong style={{ color: "#fff", fontSize: 12 }}>{name}</strong><small style={{ display: "block" }}>Website concept preview</small></div></div><div className="ps-disclaimer">Demo content is illustrative. Verified public context is presented without inventing services, prices, reviews or business claims. Owner approval is required before production publishing.</div></div></footer>
    </div>
  );
}
