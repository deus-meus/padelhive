import { create } from "zustand";
import type { User, UserRole } from "@/types";

export type MockUser = User & { avatarUrl: string };

const MOCK_USERS: Record<UserRole, MockUser> = {
  player: {
    id: "user-1",
    role: "player",
    name: "Andi Pratama",
    email: "andi@example.com",
    phone: "+6281234567890",
    avatarUrl: "https://i.pravatar.cc/150?img=11",
    createdAt: "2026-01-15T10:00:00Z",
  },
  venue_owner: {
    id: "user-2",
    role: "venue_owner",
    name: "Wayan Sudira",
    email: "wayan@padelbali.com",
    phone: "+6281234567891",
    avatarUrl: "https://i.pravatar.cc/150?img=33",
    createdAt: "2026-02-01T10:00:00Z",
  },
  venue_admin: {
    id: "user-3",
    role: "venue_admin",
    name: "Sari Dewi",
    email: "sari@padelbali.com",
    phone: "+6281234567892",
    avatarUrl: "https://i.pravatar.cc/150?img=32",
    createdAt: "2026-02-15T10:00:00Z",
  },
  super_admin: {
    id: "user-4",
    role: "super_admin",
    name: "Admin Padelhive",
    email: "admin@padelhive.com",
    phone: "+6281234567893",
    avatarUrl: "https://i.pravatar.cc/150?img=60",
    createdAt: "2026-01-01T10:00:00Z",
  },
};

export const ROLE_REDIRECTS: Record<UserRole, string> = {
  player: "/venues",
  venue_owner: "/dashboard",
  venue_admin: "/dashboard",
  super_admin: "/admin",
};

interface AuthState {
  user: MockUser | null;
  isLoading: boolean;
  login: (role: UserRole) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  login: async (role: UserRole) => {
    set({ isLoading: true });
    await new Promise((resolve) => setTimeout(resolve, 1000));
    set({ user: MOCK_USERS[role], isLoading: false });
  },
  logout: () => {
    set({ user: null });
  },
}));
