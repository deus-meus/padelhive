import { Venue } from "@/types";

export const mockVenues: Venue[] = [
  {
    id: "venue-1",
    ownerId: "user-3",
    name: "Padel Bali Arena",
    location: "Jl. Sunset Road No. 88, Seminyak",
    city: "Bali",
    description:
      "Premium padel courts in the heart of Seminyak with world-class facilities and ocean breeze.",
    imageUrl: "/venues/bali-arena.jpg",
    photos: [
      "/venues/bali-arena-1.jpg",
      "/venues/bali-arena-2.jpg",
      "/venues/bali-arena-3.jpg",
    ],
    facilities: ["Parking", "Shower", "Locker", "Pro Shop", "Cafe", "WiFi"],
    operatingHours: { open: "06:00", close: "22:00" },
    rating: 4.8,
    reviewCount: 124,
    isVerified: true,
    createdAt: "2024-01-10T09:00:00Z",
  },
  {
    id: "venue-2",
    ownerId: "user-3",
    name: "Jakarta Padel Club",
    location: "Jl. Sudirman Kav. 52, SCBD",
    city: "Jakarta",
    description:
      "State-of-the-art indoor padel facility in Jakarta's business district.",
    imageUrl: "/venues/jakarta-club.jpg",
    photos: [
      "/venues/jakarta-club-1.jpg",
      "/venues/jakarta-club-2.jpg",
    ],
    facilities: ["Parking", "Shower", "Locker", "Cafe", "AC"],
    operatingHours: { open: "07:00", close: "23:00" },
    rating: 4.6,
    reviewCount: 89,
    isVerified: true,
    createdAt: "2024-02-01T09:00:00Z",
  },
  {
    id: "venue-3",
    ownerId: "user-3",
    name: "Surabaya Padel Center",
    location: "Jl. Basuki Rahmat No. 100",
    city: "Surabaya",
    description:
      "East Java's first dedicated padel center with 6 courts and professional coaching.",
    imageUrl: "/venues/surabaya-center.jpg",
    photos: [
      "/venues/surabaya-center-1.jpg",
      "/venues/surabaya-center-2.jpg",
    ],
    facilities: ["Parking", "Shower", "Coaching", "Equipment Rental"],
    operatingHours: { open: "06:00", close: "21:00" },
    rating: 4.5,
    reviewCount: 56,
    isVerified: false,
    createdAt: "2024-03-01T09:00:00Z",
  },
];
