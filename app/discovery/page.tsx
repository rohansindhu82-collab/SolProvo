"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, ExternalLink, FileSearch, Loader2, MapPinned, Search, ShieldCheck, TriangleAlert, XCircle } from "lucide-react";

type Place = { placeId: string | null; name: string; address: string | null; website: string | null; mapsUrl: string | null; types: string[]; businessStatus: string | null; source: string };
type AuditResult = { url: string; title: string; score: number; opportunities: number; status: "ready" | "error"; message: string };

export default function DiscoveryPage() {
  const [category, setCategory] = useState("real estate agents");
  const [location, setLocation] = useState("Greater Noida");
  const [limit, setLimit] = useState("10");
  const [places, setPlaces] = useState<Place[]>([]);
  const [audits, setAudits] = useState<AuditResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [auditing, setAuditing] = useState(false);
  const [error, setError] = useState("");

  const websites = useMemo(() => places.filter((p) => p.website).map((p) => p.website as string), [places]);

  async function discover() {
    setLoading(true); setError(""); setPlaces([]); setAudits([]);
    try {
      const response = await fetch("/api/discover", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ category, location, limit: Number(limit) }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Discovery failed.");
      setPlaces(data.places || []);
    } catch (e) { setError(e instanceof Error ? e.message : "Discovery failed."); }
    finally { setLoading(false); }
  }

  async function auditDiscovered() {
    if (!websites.length) return;
    setAuditing(true); setError(""); setAudits([]);
    const next: AuditResult[] = [];
    for (const url of websites.slice(0, 10)) {
      try {
        const response = await fetch("/api/audit", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ url, businessName: places.find((p) => p.website === url)?.name || category }) });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Audit failed.");
        next.push({ url, title: data.audit.title, score: data.audit.score, opportunities: data.audit.opportunities.length, status: "ready", message: "Evidence collected" });
      } catch (e) { next.push({ url, title: "Could not analyze", score: 0, opportunities: 0, status: "error", message: e instanceof Error ? e.message : "Audit failed" }); }
    }
    setAudits(next); setAuditing(false);
  }

  return <main className="content" style={{ maxWidth: 1180, margin: "0 auto" }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
      <Link href="/" className="btn" style={{ textDecoration: "none" }}><ArrowLeft size={14} style={{ verticalAlign: "-2px", marginRight: 6 }} />ProspectOS</Link>
      <span className="badge muted"><ShieldCheck size={12} style={{ verticalAlign: "-2px", marginRight: 4 }} />Evidence-first discovery</span>
    </div>

    <div className="card panel" style={{ marginBottom: 18 }}>
      <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 8 }}><MapPinned size={20} color="var(--blue)" /><h1>Live Business Discovery</h1></div>
      <p className="sub">Find real businesses through the Google Places API, then feed only businesses with websites into our evidence-based analyzer. We do not fabricate listings, ratings, contacts or gaps.</p>
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr .35fr auto", gap: 12, marginTop: 22, alignItems: "end" }}>
        <div><label className="panel-note">Business category</label><input className="search" style={{ width: "100%", marginTop: 6 }} value={category} onChange={e => setCategory(e.target.value)} placeholder="real estate agents" /></div>
        <div><label className="panel-note">Target market</label><input className="search" style={{ width: "100%", marginTop: 6 }} value={location} onChange={e => setLocation(e.target.value)} placeholder="Greater Noida" /></div>
        <div><label className="panel-note">Results</label><select className="select" style={{ width: "100%", marginTop: 6 }} value={limit} onChange={e => setLimit(e.target.value)}><option>5</option><option>10</option><option>20</option></select></div>
        <button className="btn primary" disabled={loading || !category.trim() || !location.trim()} onClick={discover}>{loading ? <><Loader2 size={14} className="spin" style={{ verticalAlign: "-2px", marginRight: 6 }} />Finding…</> : <><Search size={14} style={{ verticalAlign: "-2px", marginRight: 6 }} />Find businesses</>}</button>
      </div>
      {error && <div style={{ marginTop: 14, padding: 12, borderRadius: 10, background: "#fff4e5", color: "#9a5b00", fontSize: 12 }}><TriangleAlert size={13} style={{ verticalAlign: "-2px", marginRight: 5 }} />{error}</div>}
    </div>

    {places.length > 0 && <section className="card panel" style={{ marginBottom: 18 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 14 }}><div><strong>Live prospects found</strong><div className="panel-note">{places.length} businesses returned for “{category} in {location}, India”.</div></div><button className="btn primary" disabled={auditing || !websites.length} onClick={auditDiscovered}>{auditing ? <><Loader2 size={14} className="spin" style={{ verticalAlign: "-2px", marginRight: 6 }} />Auditing websites…</> : <><FileSearch size={14} style={{ verticalAlign: "-2px", marginRight: 6 }} />Audit {websites.length} websites</>}</button></div>
      <div className="card table"><table><thead><tr><th>Business</th><th>Address</th><th>Website</th><th>Status</th><th>Source</th></tr></thead><tbody>{places.map(p => <tr key={p.placeId || p.name}><td><div className="business"><div className="business-icon"><MapPinned size={15} /></div><div><div className="business-name">{p.name}</div><div className="business-meta">{p.businessStatus || "Status not supplied"}</div></div></div></td><td>{p.address || "—"}</td><td>{p.website ? <a className="link-btn" href={p.website} target="_blank" rel="noreferrer">Website <ExternalLink size={11} /></a> : <span className="panel-note">No website returned</span>}</td><td>{p.mapsUrl ? <a className="link-btn" href={p.mapsUrl} target="_blank" rel="noreferrer">Maps <ExternalLink size={11} /></a> : "—"}</td><td><span className="badge muted">Places API</span></td></tr>)}</tbody></table></div>
      <p className="panel-note" style={{ marginTop: 12 }}>Google Maps/Places content is shown as discovery evidence and links. We do not turn this screen into a scraped directory or mass-contact list.</p>
    </section>}

    {audits.length > 0 && <section className="card table" style={{ marginBottom: 18 }}><div className="panel" style={{ paddingBottom: 8 }}><strong>Evidence-backed opportunity queue</strong><div className="panel-note">Only websites that were actually reachable are scored.</div></div><table><thead><tr><th>Website</th><th>Score</th><th>Signals</th><th>Evidence</th><th></th></tr></thead><tbody>{audits.map(r => <tr key={r.url}><td><div className="business"><div className="business-icon"><FileSearch size={15} /></div><div><div className="business-name">{r.title}</div><div className="business-meta">{r.url}</div></div></div></td><td>{r.status === "ready" ? <span className={`score ${r.score >= 70 ? "high" : r.score >= 50 ? "medium" : "low"}`}>{r.score}/100</span> : "—"}</td><td>{r.status === "ready" ? <span className={r.opportunities ? "badge hot" : "badge muted"}>{r.opportunities} signals</span> : "—"}</td><td><span className={r.status === "ready" ? "badge hot" : "badge warn"}>{r.status === "ready" ? <><CheckCircle2 size={12} style={{ marginRight: 4 }} />Evidence collected</> : <><XCircle size={12} style={{ marginRight: 4 }} />Failed</>}</span><div className="business-meta">{r.message}</div></td><td>{r.status === "ready" && <Link className="link-btn" href={`/analyze?url=${encodeURIComponent(r.url)}`}>Open audit</Link>}</td></tr>)}</tbody></table></section>}

    <div className="card panel" style={{ background: "var(--blue-soft)" }}><strong style={{ fontSize: 12 }}>Production rule</strong><p className="panel-note" style={{ marginTop: 6, lineHeight: 1.5 }}>Discovery uses an official API integration. The analyzer then checks the business website for observable customer-journey signals. Missing evidence means “not detected here”, not “the business definitely does not have it”.</p></div>
  </main>;
}
