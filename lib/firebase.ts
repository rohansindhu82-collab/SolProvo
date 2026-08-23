import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type Auth,
  type User,
} from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

export type { User } from "firebase/auth";

const config = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export function firebaseConfigured() {
  return Boolean(config.apiKey && config.authDomain && config.projectId && config.appId);
}

export function firebaseApp(): FirebaseApp | null {
  if (typeof window === "undefined" || !firebaseConfigured()) return null;
  return getApps().length ? getApp() : initializeApp(config);
}

export function firebaseAuth(): Auth | null {
  const app = firebaseApp();
  return app ? getAuth(app) : null;
}

export function firebaseDb(): Firestore | null {
  const app = firebaseApp();
  return app ? getFirestore(app) : null;
}

export function watchFirebaseUser(callback: (user: User | null) => void) {
  const auth = firebaseAuth();
  if (!auth) return () => undefined;
  return onAuthStateChanged(auth, callback);
}

export async function signInWithGoogle() {
  const auth = firebaseAuth();
  if (!auth) throw new Error("Firebase is not configured.");
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  return signInWithPopup(auth, provider);
}

export async function signOutFirebase() {
  const auth = firebaseAuth();
  if (!auth) return;
  await signOut(auth);
}

export function currentFirebaseUser() {
  return firebaseAuth()?.currentUser ?? null;
}
