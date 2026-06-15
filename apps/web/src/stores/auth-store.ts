import { create } from "zustand";
import { onAuthStateChanged } from "firebase/auth";
import { firebaseAuth } from "@/lib/firebase";
import {
  signInWithGoogle as authSignInWithGoogle,
  signInWithEmail as authSignInWithEmail,
  signUpWithEmail as authSignUpWithEmail,
  sendPasswordReset as authSendPasswordReset,
  signOut as authSignOut,
} from "@/lib/auth-client";
import { getMe } from "@/lib/api";
import type { UserRole } from "@/types";

export type AuthUser = {
  id: string;
  firebaseUid?: string;
  email: string;
  name: string;
  role: UserRole;
  avatarUrl?: string;
};

export const ROLE_REDIRECTS: Record<UserRole, string> = {
  player: "/venues",
  venue_owner: "/dashboard",
  venue_admin: "/dashboard",
  super_admin: "/admin",
};

interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  isInitialized: boolean;
  initialize: () => void;
  loginWithGoogle: () => Promise<AuthUser>;
  loginWithEmail: (email: string, password: string) => Promise<AuthUser>;
  registerWithEmail: (name: string, email: string, password: string) => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  login: (role: UserRole) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: false,
  isInitialized: false,

  login: async (role: UserRole) => {
    // Stub implementation to satisfy Phone OTP flow
    console.warn("Mock login called via OTP flow");
  },

  initialize: () => {
    if (get().isInitialized) return;

    onAuthStateChanged(firebaseAuth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const backendUser = await getMe();
          set({
            user: {
              ...backendUser,
              role: backendUser.role as UserRole,
              avatarUrl: firebaseUser.photoURL || undefined,
            },
          });
        } catch (error) {
          console.error("Failed to fetch user from backend", error);
          set({ user: null });
        }
      } else {
        set({ user: null });
      }
      set({ isInitialized: true });
    });
  },

  loginWithGoogle: async () => {
    set({ isLoading: true });
    try {
      await authSignInWithGoogle();
      const backendUser = await getMe();
      const authUser: AuthUser = {
        ...backendUser,
        role: backendUser.role as UserRole,
        avatarUrl: firebaseAuth.currentUser?.photoURL || undefined,
      };
      set({ user: authUser });
      return authUser;
    } finally {
      set({ isLoading: false });
    }
  },

  loginWithEmail: async (email, password) => {
    set({ isLoading: true });
    try {
      await authSignInWithEmail(email, password);
      const backendUser = await getMe();
      const authUser: AuthUser = {
        ...backendUser,
        role: backendUser.role as UserRole,
        avatarUrl: firebaseAuth.currentUser?.photoURL || undefined,
      };
      set({ user: authUser });
      return authUser;
    } finally {
      set({ isLoading: false });
    }
  },

  registerWithEmail: async (name, email, password) => {
    set({ isLoading: true });
    try {
      await authSignUpWithEmail(name, email, password);
    } finally {
      set({ isLoading: false });
    }
  },

  sendPasswordReset: async (email) => {
    set({ isLoading: true });
    try {
      await authSendPasswordReset(email);
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await authSignOut();
      set({ user: null });
    } finally {
      set({ isLoading: false });
    }
  },
}));
