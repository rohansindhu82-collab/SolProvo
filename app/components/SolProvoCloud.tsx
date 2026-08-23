"use client";

import { useEffect, useState } from "react";
import { cloudList, cloudPut } from "@/lib/cloud";
import { currentFirebaseUser, firebaseConfigured, signInWithGoogle, signOutFirebase, watchFirebaseUser, type User } from "@/lib/firebase";
import { loadActivities, loadProspects, replaceActivities, saveProspects, type ProspectActivity, type WorkspaceProspect } from "@/lib/workspace";

function displayName(user: User) {
  return user.displayName || user.email || "Signed in";
}

function syncWorkspace() {
  void (async () => {
    const user = currentFirebaseUser();
    if (!user) return;

    const [remoteProspects, remoteActivities] = await Promise.all([
      cloudList<WorkspaceProspect>("prospects"),
      cloudList<ProspectActivity>("activities"),
    ]);
    const localProspects = loadProspects();
    const localActivities = loadActivities();

    if (remoteProspects.length > 0) {
      saveProspects(remoteProspects);
    } else if (localProspects.length > 0) {
      await Promise.all(localProspects.map(item => cloudPut("prospects", item.id, item)));
    }

    if (remoteActivities.length > 0) {
      replaceActivities(remoteActivities);
    } else if (localActivities.length > 0) {
      await Promise.all(localActivities.map(item => cloudPut("activities", item.id, item)));
    }
  })().catch(() => undefined);
}

export function SolProvoCloud() {
  const [user, setUser] = useState<User | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!firebaseConfigured()) return;
    return watchFirebaseUser(nextUser => {
      setUser(nextUser);
      if (nextUser) syncWorkspace();
    });
  }, []);

  async function login() {
    setBusy(true);
    setError("");
    try {
      await signInWithGoogle();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Google sign-in failed");
    } finally {
      setBusy(false);
    }
  }

  async function logout() {
    setBusy(true);
    try { await signOutFirebase(); } finally { setBusy(false); }
  }

  if (!firebaseConfigured()) return null;

  return (
    <div style={{ position:"fixed", top:14, right:18, zIndex:100, display:"flex", alignItems:"center", gap:8, background:"rgba(255,255,255,.96)", border:"1px solid var(--line)", borderRadius:999, padding:"6px 8px 6px 10px", boxShadow:"0 8px 25px rgba(15,23,42,.08)" }}>
      {user ? (
        <>
          <span style={{ fontSize:11, color:"var(--muted)", maxWidth:180, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
            {displayName(user)}
          </span>
          <span style={{ fontSize:10, color:"var(--green)", fontWeight:700 }}>Cloud</span>
          <button className="btn" style={{ padding:"6px 9px", fontSize:10 }} disabled={busy} onClick={logout}>Sign out</button>
        </>
      ) : (
        <>
          <span style={{ fontSize:10, color:"var(--muted)" }}>Local workspace</span>
          <button className="btn primary" style={{ padding:"7px 10px", fontSize:10 }} disabled={busy} onClick={login}>{busy ? "Connecting…" : "Continue with Google"}</button>
        </>
      )}
      {error && <span title={error} style={{ fontSize:10, color:"#b42318" }}>Auth error</span>}
    </div>
  );
}

export function SolProvoCloudBootstrap({ children }: { children: React.ReactNode }) {
  return <><SolProvoCloud />{children}</>;
}
