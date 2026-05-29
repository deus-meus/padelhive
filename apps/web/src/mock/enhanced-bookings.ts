import { Payment } from "@/types";

export type EnhancedBooking = {
  id: string;
  userId: string;
  courtId: string;
  venueId: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  duration: number;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  totalAmount: number;
  platformFee: number;
  voucherCode: string | null;
  voucherDiscount: number;
  finalAmount: number;
  payment: Payment;
  participants: Participant[];
  createdAt: string;
};

export type Participant = {
  id: string;
  name: string;
  avatarUrl: string;
  rsvp: "accepted" | "pending" | "declined";
  isHost: boolean;
};

export const enhancedBookings: EnhancedBooking[] = [
  {
    id: "booking-1",
    userId: "user-1",
    courtId: "court-1",
    venueId: "venue-1",
    bookingDate: "2026-06-02",
    startTime: "09:00",
    endTime: "10:00",
    duration: 60,
    status: "confirmed",
    totalAmount: 300000,
    platformFee: 15000,
    voucherCode: "WELCOME20",
    voucherDiscount: 60000,
    finalAmount: 255000,
    payment: {
      id: "pay-1",
      bookingId: "booking-1",
      amount: 255000,
      status: "paid",
      provider: "midtrans",
      method: "GoPay",
      paidAt: "2026-05-28T14:30:00Z",
      createdAt: "2026-05-28T14:25:00Z",
    },
    participants: [
      { id: "u1", name: "Andi Pratama", avatarUrl: "https://i.pravatar.cc/150?img=11", rsvp: "accepted", isHost: true },
      { id: "u2", name: "Sari Dewi", avatarUrl: "https://i.pravatar.cc/150?img=32", rsvp: "accepted", isHost: false },
      { id: "u3", name: "Budi Santoso", avatarUrl: "https://i.pravatar.cc/150?img=15", rsvp: "pending", isHost: false },
    ],
    createdAt: "2026-05-28T14:00:00Z",
  },
  {
    id: "booking-2",
    userId: "user-1",
    courtId: "court-3",
    venueId: "venue-2",
    bookingDate: "2026-06-05",
    startTime: "18:00",
    endTime: "19:30",
    duration: 90,
    status: "confirmed",
    totalAmount: 500000,
    platformFee: 25000,
    voucherCode: null,
    voucherDiscount: 0,
    finalAmount: 525000,
    payment: {
      id: "pay-2",
      bookingId: "booking-2",
      amount: 525000,
      status: "paid",
      provider: "xendit",
      method: "BCA Virtual Account",
      paidAt: "2026-05-27T10:15:00Z",
      createdAt: "2026-05-27T10:00:00Z",
    },
    participants: [
      { id: "u1", name: "Andi Pratama", avatarUrl: "https://i.pravatar.cc/150?img=11", rsvp: "accepted", isHost: true },
      { id: "u4", name: "Lisa Tanaka", avatarUrl: "https://i.pravatar.cc/150?img=44", rsvp: "accepted", isHost: false },
      { id: "u5", name: "Reza Hakim", avatarUrl: "https://i.pravatar.cc/150?img=53", rsvp: "declined", isHost: false },
      { id: "u6", name: "Maya Putri", avatarUrl: "https://i.pravatar.cc/150?img=26", rsvp: "pending", isHost: false },
    ],
    createdAt: "2026-05-27T09:30:00Z",
  },
  {
    id: "booking-3",
    userId: "user-1",
    courtId: "court-5",
    venueId: "venue-3",
    bookingDate: "2026-05-25",
    startTime: "07:00",
    endTime: "08:00",
    duration: 60,
    status: "completed",
    totalAmount: 250000,
    platformFee: 12500,
    voucherCode: "PLAYMORE50",
    voucherDiscount: 50000,
    finalAmount: 212500,
    payment: {
      id: "pay-3",
      bookingId: "booking-3",
      amount: 212500,
      status: "paid",
      provider: "midtrans",
      method: "DANA",
      paidAt: "2026-05-23T08:00:00Z",
      createdAt: "2026-05-23T07:50:00Z",
    },
    participants: [
      { id: "u1", name: "Andi Pratama", avatarUrl: "https://i.pravatar.cc/150?img=11", rsvp: "accepted", isHost: true },
      { id: "u2", name: "Sari Dewi", avatarUrl: "https://i.pravatar.cc/150?img=32", rsvp: "accepted", isHost: false },
    ],
    createdAt: "2026-05-23T07:30:00Z",
  },
  {
    id: "booking-4",
    userId: "user-1",
    courtId: "court-2",
    venueId: "venue-1",
    bookingDate: "2026-05-20",
    startTime: "16:00",
    endTime: "17:00",
    duration: 60,
    status: "completed",
    totalAmount: 300000,
    platformFee: 15000,
    voucherCode: null,
    voucherDiscount: 0,
    finalAmount: 315000,
    payment: {
      id: "pay-4",
      bookingId: "booking-4",
      amount: 315000,
      status: "paid",
      provider: "xendit",
      method: "OVO",
      paidAt: "2026-05-18T12:00:00Z",
      createdAt: "2026-05-18T11:50:00Z",
    },
    participants: [
      { id: "u1", name: "Andi Pratama", avatarUrl: "https://i.pravatar.cc/150?img=11", rsvp: "accepted", isHost: true },
      { id: "u3", name: "Budi Santoso", avatarUrl: "https://i.pravatar.cc/150?img=15", rsvp: "accepted", isHost: false },
      { id: "u4", name: "Lisa Tanaka", avatarUrl: "https://i.pravatar.cc/150?img=44", rsvp: "accepted", isHost: false },
      { id: "u5", name: "Reza Hakim", avatarUrl: "https://i.pravatar.cc/150?img=53", rsvp: "accepted", isHost: false },
    ],
    createdAt: "2026-05-18T11:30:00Z",
  },
  {
    id: "booking-5",
    userId: "user-1",
    courtId: "court-1",
    venueId: "venue-1",
    bookingDate: "2026-05-15",
    startTime: "10:00",
    endTime: "11:00",
    duration: 60,
    status: "cancelled",
    totalAmount: 300000,
    platformFee: 15000,
    voucherCode: "WEEKEND10",
    voucherDiscount: 30000,
    finalAmount: 285000,
    payment: {
      id: "pay-5",
      bookingId: "booking-5",
      amount: 285000,
      status: "refunded",
      provider: "midtrans",
      method: "GoPay",
      paidAt: "2026-05-13T09:00:00Z",
      createdAt: "2026-05-13T08:50:00Z",
    },
    participants: [
      { id: "u1", name: "Andi Pratama", avatarUrl: "https://i.pravatar.cc/150?img=11", rsvp: "accepted", isHost: true },
    ],
    createdAt: "2026-05-13T08:30:00Z",
  },
  {
    id: "booking-6",
    userId: "user-1",
    courtId: "court-4",
    venueId: "venue-2",
    bookingDate: "2026-05-10",
    startTime: "19:00",
    endTime: "20:00",
    duration: 60,
    status: "cancelled",
    totalAmount: 400000,
    platformFee: 20000,
    voucherCode: null,
    voucherDiscount: 0,
    finalAmount: 420000,
    payment: {
      id: "pay-6",
      bookingId: "booking-6",
      amount: 420000,
      status: "failed",
      provider: "xendit",
      method: "BNI Virtual Account",
      createdAt: "2026-05-08T18:00:00Z",
    },
    participants: [
      { id: "u1", name: "Andi Pratama", avatarUrl: "https://i.pravatar.cc/150?img=11", rsvp: "accepted", isHost: true },
      { id: "u6", name: "Maya Putri", avatarUrl: "https://i.pravatar.cc/150?img=26", rsvp: "declined", isHost: false },
    ],
    createdAt: "2026-05-08T17:30:00Z",
  },
];
