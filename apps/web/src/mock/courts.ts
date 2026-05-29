import { Court } from "@/types";

export const mockCourts: Court[] = [
  {
    id: "court-1",
    venueId: "venue-1",
    name: "Court A",
    type: "outdoor",
    pricing: {
      weekdayPeak: 300000,
      weekdayOffPeak: 200000,
      weekendPeak: 400000,
      weekendOffPeak: 250000,
    },
    isActive: true,
  },
  {
    id: "court-2",
    venueId: "venue-1",
    name: "Court B",
    type: "outdoor",
    pricing: {
      weekdayPeak: 300000,
      weekdayOffPeak: 200000,
      weekendPeak: 400000,
      weekendOffPeak: 250000,
    },
    isActive: true,
  },
  {
    id: "court-3",
    venueId: "venue-2",
    name: "Court 1",
    type: "indoor",
    pricing: {
      weekdayPeak: 400000,
      weekdayOffPeak: 280000,
      weekendPeak: 500000,
      weekendOffPeak: 350000,
    },
    isActive: true,
  },
  {
    id: "court-4",
    venueId: "venue-2",
    name: "Court 2",
    type: "indoor",
    pricing: {
      weekdayPeak: 400000,
      weekdayOffPeak: 280000,
      weekendPeak: 500000,
      weekendOffPeak: 350000,
    },
    isActive: true,
  },
  {
    id: "court-5",
    venueId: "venue-3",
    name: "Court Utama",
    type: "indoor",
    pricing: {
      weekdayPeak: 250000,
      weekdayOffPeak: 180000,
      weekendPeak: 350000,
      weekendOffPeak: 220000,
    },
    isActive: true,
  },
  {
    id: "court-6",
    venueId: "venue-3",
    name: "Court Latihan",
    type: "outdoor",
    pricing: {
      weekdayPeak: 200000,
      weekdayOffPeak: 150000,
      weekendPeak: 280000,
      weekendOffPeak: 180000,
    },
    isActive: true,
  },
];
