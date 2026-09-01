import { type User as FirebaseUser, onAuthStateChanged } from "firebase/auth";
import { api } from "../api/client";
import {
  sendPasswordReset as authClientSendPasswordReset,
  signOut as authClientSignOut,
  signInWithEmail,
  signInWithGoogle,
  signUpWithEmail,
} from "../auth-client";
import { firebaseAuth } from "../firebase";

export type UserProfile = {
  id: string;
  firebaseUid?: string;
  email: string;
  name: string;
  role: string;
  avatarUrl?: string;
};

const CACHE_KEY = "padelhive_user_cache";

class AuthState {
  user = $state<UserProfile | null>(null);
  firebaseUser = $state<FirebaseUser | null>(null);
  isLoading = $state(true);
  isInitialized = $state(false);

  constructor() {
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          this.user = JSON.parse(cached);
          this.isInitialized = true;
          this.isLoading = false;
        }
      } catch (e) {
        console.warn("[AuthStore] Cache read error:", e);
      }

      onAuthStateChanged(firebaseAuth, async (fbUser) => {
        this.firebaseUser = fbUser;
        if (fbUser) {
          await this.syncUser();
        } else {
          this.user = null;
          try {
            localStorage.removeItem(CACHE_KEY);
          } catch (e) {}
          this.isLoading = false;
          this.isInitialized = true;
        }
      });
    }
  }

  async syncUser(): Promise<UserProfile | null> {
    this.isLoading = true;
    try {
      const token = await this.firebaseUser?.getIdToken();
      if (!token) {
        this.user = null;
        try {
          localStorage.removeItem(CACHE_KEY);
        } catch (e) {}
        return null;
      }
      const res = await api.auth.me.get({
        headers: { authorization: `Bearer ${token}` },
      });

      if (res.data) {
        const u = res.data;
        this.user = { ...u, role: u.role.toLowerCase() };
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify(this.user));
        } catch (e) {}
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

  async loginWithEmail(email: string, pass: string) {
    this.isLoading = true;
    try {
      const fbUser = await signInWithEmail(email, pass);
      this.firebaseUser = fbUser;
      return await this.syncUser();
    } finally {
      this.isLoading = false;
    }
  }

  async registerWithEmail(name: string, email: string, pass: string) {
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
      await authClientSignOut();
      this.user = null;
      this.firebaseUser = null;
      try {
        localStorage.removeItem(CACHE_KEY);
      } catch (e) {}
    } finally {
      this.isLoading = false;
    }
  }

  async sendPasswordReset(email: string) {
    return authClientSendPasswordReset(email);
  }
}

export const authStore = new AuthState();
