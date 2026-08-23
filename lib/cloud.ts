import { collection, deleteDoc, doc, getDoc, getDocs, setDoc, type DocumentData } from "firebase/firestore";
import { currentFirebaseUser, firebaseDb, firebaseConfigured } from "@/lib/firebase";

const WORKSPACE_KEY = "solprovo.workspace.id.v2";
const DEFAULT_WORKSPACE = process.env.NEXT_PUBLIC_SOLPROVO_WORKSPACE_ID || "local-workspace";

export function getWorkspaceId(userId?: string) {
  if (userId) {
    const id = userId;
    if (typeof window !== "undefined") localStorage.setItem(WORKSPACE_KEY, id);
    return id;
  }
  if (typeof window === "undefined") return DEFAULT_WORKSPACE;
  return localStorage.getItem(WORKSPACE_KEY) || DEFAULT_WORKSPACE;
}

export function cloudEnabled() {
  return typeof window !== "undefined" && firebaseConfigured();
}

async function ensureWorkspace(userId: string) {
  const db = firebaseDb();
  if (!db) return null;
  const workspaceId = getWorkspaceId(userId);
  const ref = doc(db, "workspaces", workspaceId);
  const snapshot = await getDoc(ref);
  if (!snapshot.exists()) {
    await setDoc(ref, {
      id: workspaceId,
      ownerId: userId,
      name: "SolProvo Workspace",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }
  return workspaceId;
}

async function workspaceCollection(name: string) {
  const db = firebaseDb();
  const user = currentFirebaseUser();
  if (!db || !user) return null;
  const workspaceId = await ensureWorkspace(user.uid);
  if (!workspaceId) return null;
  return collection(db, "workspaces", workspaceId, name);
}

export async function cloudPut<T extends DocumentData>(collectionName: string, id: string, data: T) {
  const ref = await workspaceCollection(collectionName);
  if (!ref) return false;
  const user = currentFirebaseUser();
  await setDoc(doc(ref, id), {
    ...data,
    workspaceId: getWorkspaceId(user?.uid),
    ownerId: user?.uid,
    syncedAt: new Date().toISOString(),
  }, { merge: true });
  return true;
}

export async function cloudDelete(collectionName: string, id: string) {
  const ref = await workspaceCollection(collectionName);
  if (!ref) return false;
  await deleteDoc(doc(ref, id));
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
    const user = currentFirebaseUser();
    if (!user) return { configured: true, authenticated: false, workspaceId: getWorkspaceId() };
    const workspaceId = await ensureWorkspace(user.uid);
    return { configured: true, authenticated: true, workspaceId, uid: user.uid };
  } catch {
    return { configured: true, authenticated: false, workspaceId: getWorkspaceId() };
  }
}
