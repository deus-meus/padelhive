import {
  signInWithPopup,
  signOut as firebaseSignOut,
  type User as FirebaseUser,
} from "firebase/auth";
import { firebaseAuth, googleProvider } from "@/lib/firebase";

export function getCurrentUser(): FirebaseUser | null {
  return firebaseAuth.currentUser;
}

export async function getIdToken(): Promise<string | null> {
  const user = getCurrentUser();
  if (!user) return null;
  return user.getIdToken();
}

export async function signInWithGoogle(): Promise<FirebaseUser> {
  const credential = await signInWithPopup(firebaseAuth, googleProvider);
  return credential.user;
}

export async function signOut(): Promise<void> {
  await firebaseSignOut(firebaseAuth);
}
