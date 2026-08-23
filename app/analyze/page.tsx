"use client";

import { FormEvent, useEffect, useState } from "react";
import { ArrowLeft, CheckCircle2, ExternalLink, FileSearch, Loader2, ShieldCheck, TriangleAlert, XCircle } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

type AuditSignal = { key: string; label: string; detected: boolean; confidence: string; evidence: string[] };
type Audit = { url: string; finalUrl: string; title: string; description: string; scannedAt: string; score: number; signals: AuditSignal[]; opportunities: { key: string; title: string; reason: string }[]; limitations: string[] };
const CACHE_PREFIX = "solprovo.audit.v1:";
function cacheKey(url: string) { return `${CACHE_PREFIX}${url.trim().toLowerCase()}`; }
function readCachedAudit(url: string): Audit | null { try { const raw = sessionStorage.getItem(cacheKey(url)); return raw ? JSON.parse(raw) as Audit : null; } catch { return null; } }
function writeCachedAudit(audit: Audit) { try { sessionStorage.setItem(cacheKey(audit.url), JSON.stringify(audit)); } catch { /* best effort */ } }

export default function AnalyzePage() {
  const searchParams = useSearchParams();
  const [url, setUrl] = useState("");
  const [audit, setAudit] = useState<Audit | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function runAudit(targetUrl: string) {
    const normalizedUrl = targetUrl.trim();
    if (!normalizedUrl) return;
    setLoading(true); setError(""); setUrl(normalizedUrl);
    const cached = readCachedAudit(normalizedUrl);
    if (cached) { setAudit(cached); setLoading(false); return; }
    setAudit(null);
    try {
      const response = await fetch("/api/audit", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ url: normalizedUrl }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Audit failed.");
      const result = (data.audit ?? data) as Audit;
      setAudit(result); writeCachedAudit(result);
    } catch (e) { setError(e instanceof Error ? e.message : "Audit failed."); }
    finally { setLoading(false); }
  }

  useEffect(() => { const initialUrl = searchParams.get("url"); if (initialUrl) void runAudit(initialUrl); }, [searchParams]);
  async function submit(event: FormEvent) { event.preventDefault(); await runAudit(url); }
  const backHref = searchParams.get("from") === "discovery" ? "/discovery" : "/";

  return (
    <main className="content" style={{ maxWidth: 1120, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
        <Link href={backHref} className="btn" style={{ textDecoration: "none" }}><ArrowLeft size={14} style={{ verticalAlign: "-2px", marginRight: 6 }} />{backHref === "/discovery" ? "Discovery" : "ProspectOS"}</Link>
        <span className="badge muted"><ShieldCheck size={12} style={{ verticalAlign: "-2px", marginRight: 4 }} />Evidence-first audit</span>
      </div>
      <div className="card panel" style={{ marginBottom: 18 }}>
        <div style={{ maxWidth: 720 }}><div className="badge hot" style={{ marginBottom: 12 }}><FileSearch size={12} style={{ verticalAlign: "-2px", marginRight: 4 }} />Business Analyzer v0.1</div><h1>Analyze a business website</h1><p className="sub">SolProvo checks the supplied public page for observable customer-journey signals. It reports what was detected — and avoids pretending that an absent signal proves a business does not have the capability elsewhere.</p></div>
        <form onSubmit={submit} style={{ display: "flex", gap: 10, marginTop: 24 }}><input className="search" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://example-business.in" aria-label="Business website URL" required /><button className="btn primary" disabled={loading}>{loading ? <><Loader2 size={14} className="spin" style={{ verticalAlign: "-2px", marginRight: 6 }} />Scanning</> : <><FileSearch size={14} style={{ verticalAlign: "-2px", marginRight: 6 }} />Analyze</>}</button></form>
        {error && <div style={{ marginTop: 14, padding: 12, borderRadius: 9, background: "var(--red-soft)", color: "var(--red)", fontSize: 12 }}><TriangleAlert size={14} style={{ verticalAlign: "-2px", marginRight: 6 }} />{error}</div>}
      </div>
      {audit && <>
        <div className="stats"><div className="card stat"><div className="stat-top"><span>Journey score</span><FileSearch size={15} /></div><div className="stat-value">{audit.score}</div><div className="stat-note neutral">Observable signals</div></div><div className="card stat"><div className="stat-top"><span>Detected</span><CheckCircle2 size={15} /></div><div className="stat-value">{audit.signals.filter(s => s.detected).length}</div><div className="stat-note">of {audit.signals.length} signals</div></div><div className="card stat"><div className="stat-top"><span>Opportunities</span><TriangleAlert size={15} /></div><div className="stat-value">{audit.opportunities.length}</div><div className="stat-note neutral">Needs human verification</div></div><div className="card stat"><div className="stat-top"><span>Page</span><ExternalLink size={15} /></div><div className="stat-value" style={{ fontSize: 15, overflow: "hidden", textOverflow: "ellipsis" }}>{audit.title}</div><div className="stat-note neutral">{new URL(audit.finalUrl).hostname}</div></div></div>
        <div className="grid2"><div className="card panel"><div className="panel-head"><div><h2>Observed signals</h2><div className="panel-note">Scanned {new Date(audit.scannedAt).toLocaleString()}</div></div><a className="btn" href={audit.finalUrl} target="_blank" rel="noreferrer">Open site</a></div><div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 10 }}>{audit.signals.map((signal) => <div key={signal.key} style={{ padding: 13, border: "1px solid var(--line)", borderRadius: 9 }}><div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}><strong style={{ fontSize: 12 }}>{signal.label}</strong>{signal.detected ? <CheckCircle2 size={15} color="var(--green)" /> : <XCircle size={15} color="var(--red)" />}</div><div style={{ marginTop: 7, color: signal.detected ? "var(--green)" : "var(--muted)", fontSize: 10, fontWeight: 700 }}>{signal.detected ? `Detected · ${signal.confidence} confidence` : "Not detected on scanned page"}</div><p style={{ marginTop: 7, color: "var(--muted)", fontSize: 10, lineHeight: 1.45 }}>{signal.evidence[0]}</p></div>)}</div></div><div className="card panel"><div className="panel-head"><div><h2>Potential opportunities</h2><div className="panel-note">Sales suggestions, not invented deficiencies</div></div></div>{audit.opportunities.length ? audit.opportunities.map((item) => <div className="opportunity" key={item.key}><div className="dot" /><div><strong>{item.title}</strong><p>{item.reason}</p></div></div>) : <div style={{ padding: 16, borderRadius: 9, background: "var(--green-soft)", color: "var(--green)", fontSize: 12 }}>No obvious opportunities were detected on this page. That's useful too — don't pitch a problem that isn't there.</div>}<div style={{ marginTop: 18, padding: 12, borderRadius: 9, background: "var(--amber-soft)", color: "var(--amber)", fontSize: 10, lineHeight: 1.5 }}><strong>Audit limitation:</strong> {audit.limitations[0]}</div></div></div>
      </>}
    </main>
  );
}
