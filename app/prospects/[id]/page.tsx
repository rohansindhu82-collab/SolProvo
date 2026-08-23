"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CalendarClock, CheckCircle2, ExternalLink, FileSearch, MessageSquare, Save, Sparkles, Target, UserRound, XCircle } from "lucide-react";
import { addActivity, loadActivities, loadProspects, updateProspect, type ProspectActivity, type WorkspaceProspect } from "@/lib/workspace";
import { buildProspectIntelligence } from "@/lib/intelligence";
import { useParams } from "next/navigation";

const stages: WorkspaceProspect["stage"][] = ["New", "Contacted", "Interested", "Demo", "Won", "Disqualified"];

export default function ProspectIntelligencePage() {
  const params = useParams<{ id: string }>();
  const id = decodeURIComponent(params.id || "");
  const [prospect, setProspect] = useState<WorkspaceProspect | null>(null);
  const [activities, setActivities] = useState<ProspectActivity[]>([]);
  const [note, setNote] = useState("");
  const [followUpAt, setFollowUpAt] = useState("");
  const [saved, setSaved] = useState(false);

  function refresh() {
    const item = loadProspects().find(p => p.id === id) || null;
    setProspect(item);
    setActivities(loadActivities(id));
    setFollowUpAt(item?.followUpAt ? item.followUpAt.slice(0, 16) : "");
  }

  useEffect(() => { refresh(); }, [id]);

  const intelligence = useMemo(() => prospect ? buildProspectIntelligence(prospect) : null, [prospect]);

  if (!prospect) {
    return <main className="content" style={{ maxWidth: 1100, margin: "0 auto" }}><Link href="/" className="btn" style={{ textDecoration: "none" }}><ArrowLeft size={14} style={{ verticalAlign: "-2px", marginRight: 6 }} />Back to workspace</Link><div className="card panel" style={{ marginTop: 18 }}><h1>Prospect not found</h1><p className="sub">This prospect is not available in the current browser workspace.</p></div></main>;
  }

  function changeStage(stage: WorkspaceProspect["stage"]) {
    updateProspect(prospect.id, { stage });
    refresh();
  }

  function saveFollowUp(event: FormEvent) {
    event.preventDefault();
    updateProspect(prospect.id, { followUpAt: followUpAt ? new Date(followUpAt).toISOString() : undefined, nextAction: followUpAt ? `Follow up ${new Date(followUpAt).toLocaleString()}` : prospect.nextAction });
    addActivity({ prospectId: prospect.id, type: "follow-up", title: followUpAt ? "Follow-up scheduled" : "Follow-up cleared", detail: followUpAt ? new Date(followUpAt).toLocaleString() : "No follow-up date set" });
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
    refresh();
  }

  function saveNote(event: FormEvent) {
    event.preventDefault();
    const value = note.trim();
    if (!value) return;
    addActivity({ prospectId: prospect.id, type: "note", title: "Sales note added", detail: value });
    setNote("");
    refresh();
  }

  return <main className="content" style={{ maxWidth: 1180, margin: "0 auto" }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
      <Link href="/" className="btn" style={{ textDecoration: "none" }}><ArrowLeft size={14} style={{ verticalAlign: "-2px", marginRight: 6 }} />Workspace</Link>
      <div style={{ display: "flex", gap: 8 }}><Link href={`/analyze?url=${encodeURIComponent(prospect.website || "")}`} className="btn" style={{ textDecoration: "none" }}><FileSearch size={14} style={{ verticalAlign: "-2px", marginRight: 5 }} />Audit</Link><Link href={`/demo?prospect=${encodeURIComponent(prospect.id)}`} className="btn primary" style={{ textDecoration: "none" }}><Sparkles size={14} style={{ verticalAlign: "-2px", marginRight: 5 }} />Create demo</Link></div>
    </div>

    <section className="card panel" style={{ marginBottom: 18 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 20, alignItems: "start" }}>
        <div style={{ minWidth: 0 }}>
          <div className="badge muted" style={{ marginBottom: 9 }}>{prospect.category} · {prospect.location}</div>
          <h1 style={{ marginBottom: 6 }}>{prospect.name}</h1>
          <p className="sub" style={{ marginBottom: 10 }}>{prospect.website ? <a href={prospect.website} target="_blank" rel="noreferrer" style={{ color: "var(--blue)" }}>{prospect.website} <ExternalLink size={11} style={{ verticalAlign: "-2px" }} /></a> : "No website recorded"}</p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}><span className={`badge ${prospect.stage === "Won" ? "hot" : prospect.stage === "Demo" || prospect.stage === "Interested" ? "warn" : "muted"}`}>{prospect.stage}</span><span className={`badge ${prospect.opportunityLabel === "High" ? "hot" : prospect.opportunityLabel === "Medium" ? "warn" : "muted"}`}>{prospect.opportunityLabel || "Unrated"} opportunity</span>{prospect.recommendedPackage && <span className="badge muted">{prospect.recommendedPackage} package</span>}</div>
        </div>
        <div style={{ textAlign: "right", minWidth: 130 }}><div className={`score ${prospect.score >= 75 ? "high" : prospect.score >= 40 ? "medium" : "low"}`} style={{ fontSize: 28 }}>{prospect.score}/100</div><div className="business-meta">observable opportunity</div></div>
      </div>
    </section>

    <div className="grid2" style={{ marginBottom: 18 }}>
      <section className="card panel">
        <div className="panel-head"><div><h2>Opportunity brief</h2><div className="panel-note">Evidence-backed sales context</div></div><Target size={16} color="var(--blue)" /></div>
        <div style={{ padding: 14, borderRadius: 10, background: "var(--blue-soft)", marginBottom: 12 }}><strong style={{ fontSize: 13 }}>{prospect.recommendedService || intelligence?.recommendedService}</strong><p className="panel-note" style={{ marginTop: 6, lineHeight: 1.5 }}>{prospect.opportunityReason || intelligence?.reason}</p></div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}><div className="metric"><span>Verified gaps</span><strong>{prospect.gaps}</strong></div><div className="metric"><span>Recommended demo</span><strong style={{ fontSize: 12 }}>{prospect.demoType || intelligence?.demoType}</strong></div></div>
      </section>

      <section className="card panel">
        <div className="panel-head"><div><h2>Sales action</h2><div className="panel-note">One clear next move</div></div><CalendarClock size={16} color="var(--green)" /></div>
        <div style={{ padding: 13, border: "1px solid var(--line)", borderRadius: 10, marginBottom: 12 }}><div className="business-meta">NEXT BEST ACTION</div><strong style={{ display: "block", marginTop: 6 }}>{prospect.nextAction}</strong></div>
        <label className="panel-note">Pipeline stage</label><select className="select" style={{ width: "100%", marginTop: 6 }} value={prospect.stage} onChange={e => changeStage(e.target.value as WorkspaceProspect["stage"])}>{stages.map(stage => <option key={stage}>{stage}</option>)}</select>
        <form onSubmit={saveFollowUp} style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 8, marginTop: 12 }}><input className="search" type="datetime-local" value={followUpAt} onChange={e => setFollowUpAt(e.target.value)} /><button className="btn" type="submit"><Save size={13} style={{ verticalAlign: "-2px", marginRight: 5 }} />{saved ? "Saved" : "Follow-up"}</button></form>
      </section>
    </div>

    <div className="grid2">
      <section className="card panel">
        <div className="panel-head"><div><h2>Activity timeline</h2><div className="panel-note">Stage changes, audits, notes and follow-ups</div></div><MessageSquare size={16} color="var(--muted)" /></div>
        {activities.length ? <div style={{ display: "grid", gap: 10 }}>{activities.map(item => <div key={item.id} style={{ display: "grid", gridTemplateColumns: "10px 1fr", gap: 10 }}><div style={{ width: 8, height: 8, borderRadius: 99, background: "var(--blue)", marginTop: 5 }} /><div><div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}><strong style={{ fontSize: 12 }}>{item.title}</strong><span className="business-meta">{new Date(item.createdAt).toLocaleString()}</span></div>{item.detail && <p className="panel-note" style={{ marginTop: 4, lineHeight: 1.45 }}>{item.detail}</p>}</div></div>)}</div> : <div className="panel-note">No activity yet. Stage changes and notes will appear here.</div>}
      </section>

      <section className="card panel">
        <div className="panel-head"><div><h2>Sales notes</h2><div className="panel-note">Keep human context attached to the prospect</div></div><UserRound size={16} color="var(--muted)" /></div>
        <form onSubmit={saveNote}><textarea className="search" value={note} onChange={e => setNote(e.target.value)} placeholder="What did the owner say? What should we remember?" rows={6} style={{ width: "100%", boxSizing: "border-box", resize: "vertical" }} /><button className="btn primary" type="submit" style={{ marginTop: 10 }}><MessageSquare size={13} style={{ verticalAlign: "-2px", marginRight: 5 }} />Add note</button></form>
      </section>
    </div>

    <section className="card panel" style={{ marginTop: 18, background: "var(--blue-soft)" }}><strong style={{ fontSize: 12 }}>Trust rule</strong><p className="panel-note" style={{ marginTop: 6, lineHeight: 1.5 }}>This page separates observable evidence from sales judgment. A missing website signal means “not detected on the scanned page”, never proof that the business cannot provide that capability elsewhere.</p></section>
  </main>;
}
