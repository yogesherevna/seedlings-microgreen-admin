import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type User
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "./firebase";
import type { UserProfile } from "@/types/auth";

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snapshot = await getDoc(doc(db, "userProfiles", uid));
  return snapshot.exists() ? (snapshot.data() as UserProfile) : null;
}

export async function loginAdmin(email: string, password: string) {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  const profile = await getUserProfile(credential.user.uid);

  if (!profile || profile.role !== "ADMIN" || profile.status !== "active") {
    await signOut(auth);
    throw new Error("This account is not authorized for the Seedlings Admin Portal.");
  }

  return credential.user;
}

export async function logoutAdmin() {
  await signOut(auth);
}

export function subscribeToAuth(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}