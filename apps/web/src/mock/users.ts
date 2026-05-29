import { User } from "@/types";

export const mockUsers: User[] = [
  {
    id: "user-1",
    role: "player",
    name: "Andi Pratama",
    email: "andi@example.com",
    phone: "+6281234567890",
    avatarUrl: "https://i.pravatar.cc/150?img=11",
    createdAt: "2024-01-15T08:00:00Z",
  },
  {
    id: "user-2",
    role: "player",
    name: "Sari Dewi",
    email: "sari@example.com",
    phone: "+6281234567891",
    avatarUrl: "https://i.pravatar.cc/150?img=32",
    createdAt: "2024-01-20T10:00:00Z",
  },
  {
    id: "user-3",
    role: "venue_owner",
    name: "Budi Santoso",
    email: "budi@example.com",
    phone: "+6281234567892",
    createdAt: "2024-01-10T09:00:00Z",
  },
  {
    id: "user-4",
    role: "super_admin",
    name: "Admin Padelhive",
    email: "admin@padelhive.com",
    phone: "+6281234567899",
    createdAt: "2024-01-01T00:00:00Z",
  },
];
