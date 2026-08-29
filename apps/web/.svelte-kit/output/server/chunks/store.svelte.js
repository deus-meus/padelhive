import "clsx";
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, signOut as signOut$1, sendPasswordResetEmail, onAuthStateChanged } from "firebase/auth";
import { a as api } from "./client.js";
import { getApps, getApp, initializeApp } from "firebase/app";
const __vite_import_meta_env__ = {};
const env = typeof import.meta !== "undefined" && __vite_import_meta_env__ || {};
const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyDM1E7HgH5WQjdHiUGAr04FJLnLsKoDBtE",
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "padelhive-89c92.firebaseapp.com",
  projectId: env.VITE_FIREBASE_PROJECT_ID || env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "padelhive-89c92",
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "padelhive-89c92.firebasestorage.app",
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "1050034071060",
  appId: env.VITE_FIREBASE_APP_ID || env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:1050034071060:web:bf38e90b5139499d6d2901"
};
const firebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const firebaseAuth = getAuth(firebaseApp);
const googleProvider = new GoogleAuthProvider();
async function signInWithGoogle() {
  const credential = await signInWithPopup(firebaseAuth, googleProvider);
  return credential.user;
}
async function signInWithEmail(email, password) {
  const credential = await signInWithEmailAndPassword(
    firebaseAuth,
    email,
    password
  );
  return credential.user;
}
async function signUpWithEmail(name, email, password) {
  const credential = await createUserWithEmailAndPassword(
    firebaseAuth,
    email,
    password
  );
  await updateProfile(credential.user, { displayName: name });
  await credential.user.getIdToken(true);
  return credential.user;
}
async function sendPasswordReset(email) {
  await sendPasswordResetEmail(firebaseAuth, email);
}
async function signOut() {
  await signOut$1(firebaseAuth);
}
class AuthState {
  user = null;
  firebaseUser = null;
  isLoading = true;
  isInitialized = false;
  constructor() {
    if (typeof window !== "undefined") {
      onAuthStateChanged(firebaseAuth, async (fbUser) => {
        this.firebaseUser = fbUser;
        if (fbUser) {
          await this.syncUser();
        } else {
          this.user = null;
          this.isLoading = false;
          this.isInitialized = true;
        }
      });
    }
  }
  async syncUser() {
    this.isLoading = true;
    try {
      const token = await this.firebaseUser?.getIdToken();
      if (!token) {
        this.user = null;
        return null;
      }
      const res = await api.auth.me.get({ headers: { authorization: `Bearer ${token}` } });
      if (res.data) {
        const u = res.data;
        this.user = { ...u, role: u.role.toLowerCase() };
        return this.user;
      }
    } catch (err) {
      console.warn("[AuthStore] Sync error:", err);
    } finally {
      this.isLoading = false;
      this.isInitialized = true;
    }
    return null;
  }
  async loginWithGoogle() {
    this.isLoading = true;
    try {
      const fbUser = await signInWithGoogle();
      this.firebaseUser = fbUser;
      return await this.syncUser();
    } finally {
      this.isLoading = false;
    }
  }
  async loginWithEmail(email, pass) {
    this.isLoading = true;
    try {
      const fbUser = await signInWithEmail(email, pass);
      this.firebaseUser = fbUser;
      return await this.syncUser();
    } finally {
      this.isLoading = false;
    }
  }
  async registerWithEmail(name, email, pass) {
    this.isLoading = true;
    try {
      const fbUser = await signUpWithEmail(name, email, pass);
      this.firebaseUser = fbUser;
      return await this.syncUser();
    } finally {
      this.isLoading = false;
    }
  }
  async logout() {
    this.isLoading = true;
    try {
      await signOut();
      this.user = null;
      this.firebaseUser = null;
    } finally {
      this.isLoading = false;
    }
  }
  async sendPasswordReset(email) {
    return sendPasswordReset(email);
  }
}
const authStore = new AuthState();
export {
  authStore as a
};
