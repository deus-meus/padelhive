import "clsx";
import { signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, signOut as signOut$1, onAuthStateChanged } from "firebase/auth";
import { a as api } from "./client.js";
import { f as firebaseAuth, g as googleProvider } from "./firebase.js";
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
}
const authStore = new AuthState();
export {
  authStore as a
};
