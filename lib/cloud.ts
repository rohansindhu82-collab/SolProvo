import { collection, doc, getDocs, setDoc, type DocumentData } from "firebase/firestore";
import { ensureFirebaseUser, firebaseDb, firebaseConfigured } from "@/lib/firebase";

const WORKSPACE_KEY = "solprovo.workspace.id.v1";
const DEFAULT_WORKSPACE = process.env.NEXT_PUBLIC_SOLPROVO_WORKSPACE_ID || "demo-workspace";

export function getWorkspaceId() {
  if (typeof window === "undefined") return DEFAULT_WORKSPACE;
  const existing = localStorage.getItem(WORKSPACE_KEY);
  if (existing) return existing;
  localStorage.setItem(WORKSPACE_KEY, DEFAULT_WORKSPACE);
  return DEFAULT_WORKSPACE;
}

export function cloudEnabled() {
  return typeof window !== "undefined" && firebaseConfigured();
}

async function workspaceCollection(name: string) {
  const db = firebaseDb();
  const user = await ensureFirebaseUser();
  if (!db || !user) return null;
  return collection(db, "workspaces", getWorkspaceId(), name);
}

export async function cloudPut<T extends DocumentData>(collectionName: string, id: string, data: T) {
  const ref = await workspaceCollection(collectionName);
  if (!ref) return false;
  await setDoc(doc(ref, id), { ...data, workspaceId: getWorkspaceId(), syncedAt: new Date().toISOString() }, { merge: true });
  return true;
}

export async function cloudList<T>(collectionName: string): Promise<T[]> {
  const ref = await workspaceCollection(collectionName);
  if (!ref) return [];
  const snapshot = await getDocs(ref);
  return snapshot.docs.map(item => item.data() as T);
}

export async function cloudHealth() {
  if (!cloudEnabled()) return { configured: false, authenticated: false, workspaceId: getWorkspaceId() };
  try {
    const user = await ensureFirebaseUser();
    return { configured: true, authenticated: Boolean(user), workspaceId: getWorkspaceId(), uid: user?.uid };
  } catch {
    return { configured: true, authenticated: false, workspaceId: getWorkspaceId() };
  }
}
