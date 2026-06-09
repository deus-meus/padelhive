export type UserRole = "player" | "venue_owner" | "venue_admin" | "super_admin";

export interface User {
  id: string;
  role: UserRole;
  name: string;
  email: string;
  phone: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface Venue {
  id: string;
  ownerId: string;
  name: string;
  location: string;
  city: string;
  description: string;
  imageUrl: string;
  photos: string[];
  facilities: string[];
  operatingHours: {
    open: string;
    close: string;
  };
  rating: number;
  reviewCount: number;
  isVerified: boolean;
  status?: "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED";
  createdAt: string;
}

export interface Court {
  id: string;
  venueId: string;
  name: string;
  type: "indoor" | "outdoor";
  pricing: {
    weekdayPeak: number;
    weekdayOffPeak: number;
    weekendPeak: number;
    weekendOffPeak: number;
  };
  isActive: boolean;
}

export type BookingStatus =
  | "pending"
  | "confirmed"
  | "completed"
  | "cancelled"
  | "expired";

export interface Booking {
  id: string;
  userId: string;
  courtId: string;
  venueId: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  status: BookingStatus;
  totalAmount: number;
  createdAt: string;
}

export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";
export type PaymentProvider = "midtrans" | "xendit";

export interface Payment {
  id: string;
  bookingId: string;
  amount: number;
  status: PaymentStatus;
  provider: PaymentProvider;
  method: string;
  paidAt?: string;
  createdAt: string;
}

export type AttendanceStatus = "pending" | "accepted" | "declined";

export interface Invite {
  id: string;
  bookingId: string;
  userId: string;
  attendanceStatus: AttendanceStatus;
  createdAt: string;
}

export type VoucherType = "nominal" | "percentage";

export interface Voucher {
  id: string;
  code: string;
  type: VoucherType;
  value: number;
  minPurchase?: number;
  maxDiscount?: number;
  usageLimit: number;
  usedCount: number;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
}

export type RefundStatus = "pending" | "approved" | "rejected" | "processed";

export interface Refund {
  id: string;
  bookingId: string;
  amount: number;
  reason: string;
  status: RefundStatus;
  createdAt: string;
  processedAt?: string;
}
