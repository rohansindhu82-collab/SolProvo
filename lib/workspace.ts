export type ProspectStage = "New" | "Contacted" | "Interested" | "Demo" | "Won" | "Disqualified";
export type WorkspaceProspect = {
  id: string;
  name: string;
  category: string;
  location: string;
  website?: string;
  mapsUrl?: string;
  score: number;
  gaps: number;
  stage: ProspectStage;
  nextAction: string;
  createdAt: string;
  source: "Google Places" | "Manual";
};

const KEY = "solprovo.workspace.v1";
const EVENT = "solprovo:workspace-changed";

export function loadProspects(): WorkspaceProspect[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; }
}

export function saveProspects(items: WorkspaceProspect[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(items));
  window.dispatchEvent(new Event(EVENT));
}

export function upsertProspect(item: WorkspaceProspect) {
  const items = loadProspects();
  const index = items.findIndex(x => x.id === item.id);
  if (index >= 0) items[index] = { ...items[index], ...item };
  else items.unshift(item);
  saveProspects(items);
}

export function updateProspect(id: string, patch: Partial<WorkspaceProspect>) {
  saveProspects(loadProspects().map(x => x.id === id ? { ...x, ...patch } : x));
}

export function workspaceEventName() { return EVENT; }
