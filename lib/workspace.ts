import { cloudDelete, cloudPut } from "@/lib/cloud";

export type ProspectStage = "New" | "Contacted" | "Interested" | "Demo" | "Won" | "Disqualified";
export type WorkspaceProspect = {
  id: string; name: string; category: string; location: string; website?: string; mapsUrl?: string; phone?: string;
  imageUrls?: string[]; mapsPhotoNames?: string[]; score: number; gaps: number; stage: ProspectStage; nextAction: string;
  followUpAt?: string; updatedAt?: string; createdAt: string; source: "Google Places" | "Manual";
  opportunityLabel?: "High" | "Medium" | "Low"; opportunityReason?: string; recommendedService?: string;
  recommendedPackage?: "Starter" | "Growth" | "Premium"; demoType?: "lead-capture" | "appointment" | "offers" | "reactivation";
  blueprintId?: string; conversionGoal?: string; primaryCta?: string; secondaryCta?: string; chatbotIntents?: string[];
};
export type ProspectActivity = { id: string; prospectId: string; type: "stage" | "note" | "audit" | "demo" | "contact" | "follow-up"; title: string; detail?: string; createdAt: string };
const KEY = "solprovo.workspace.v1"; const ACTIVITY_KEY = "solprovo.activities.v1"; const EVENT = "solprovo:workspace-changed";
export function loadProspects(): WorkspaceProspect[] { if (typeof window === "undefined") return []; try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; } }
export function saveProspects(items: WorkspaceProspect[]) { if (typeof window === "undefined") return; localStorage.setItem(KEY, JSON.stringify(items)); window.dispatchEvent(new Event(EVENT)); void Promise.all(items.map(item => cloudPut("prospects", item.id, item))).catch(() => undefined); }
export function upsertProspect(item: WorkspaceProspect) { const items = loadProspects(); const index = items.findIndex(x => x.id === item.id); const next = { ...item, updatedAt: new Date().toISOString() }; if (index >= 0) items[index] = { ...items[index], ...next }; else items.unshift(next); saveProspects(items); }
export function removeProspect(id: string) { if (typeof window === "undefined") return; const items = loadProspects(); if (!items.some(x => x.id === id)) return; localStorage.setItem(KEY, JSON.stringify(items.filter(x => x.id !== id))); window.dispatchEvent(new Event(EVENT)); void cloudDelete("prospects", id).catch(() => undefined); }
export function updateProspect(id: string, patch: Partial<WorkspaceProspect>) { const current = loadProspects().find(x => x.id === id); saveProspects(loadProspects().map(x => x.id === id ? { ...x, ...patch, updatedAt: new Date().toISOString() } : x)); if (current && patch.stage && patch.stage !== current.stage) addActivity({ prospectId:id, type:"stage", title:`Stage changed to ${patch.stage}`, detail:current.stage + " → " + patch.stage }); }
export function loadActivities(prospectId?: string): ProspectActivity[] { if (typeof window === "undefined") return []; try { const items: ProspectActivity[] = JSON.parse(localStorage.getItem(ACTIVITY_KEY) || "[]"); return prospectId ? items.filter(x => x.prospectId === prospectId) : items; } catch { return []; } }
export function replaceActivities(items: ProspectActivity[]) { if (typeof window === "undefined") return; localStorage.setItem(ACTIVITY_KEY, JSON.stringify(items.slice(0, 500))); window.dispatchEvent(new Event(EVENT)); }
export function addActivity(activity: Omit<ProspectActivity, "id" | "createdAt">) { if (typeof window === "undefined") return; const item = { ...activity, id: `${activity.prospectId}:${Date.now()}`, createdAt: new Date().toISOString() }; const items = loadActivities(); items.unshift(item); replaceActivities(items); void cloudPut("activities", item.id, item).catch(() => undefined); }
export function workspaceEventName() { return EVENT; }
