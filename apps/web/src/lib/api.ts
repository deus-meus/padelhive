import { padelImg } from "@/lib/images";
import { Court, Venue, Voucher } from "@/types";
import { getIdToken } from "@/lib/auth-client";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api";

type ApiVenue = {
  id: string;
  name: string;
  slug: string;
  location: string;
  city: string;
  description: string;
  imageUrl: string | null;
  photos: string[];
  facilities: string[];
  openTime: string;
  closeTime: string;
  rating: number;
  reviewCount: number;
  status: "APPROVED" | string;
};

type ApiCourt = {
  id: string;
  name: string;
  type: "INDOOR" | "OUTDOOR";
  weekdayPeak: number;
  weekdayOffPeak: number;
  weekendPeak: number;
  weekendOffPeak: number;
  isActive: boolean;
};

type ApiVoucher = {
  id: string;
  code: string;
  type: "NOMINAL" | "PERCENTAGE";
  value: number;
  minPurchase: number | null;
  maxDiscount: number | null;
  usageLimit: number;
  usedCount: number;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
};

export type ApiBooking = {
  id: string;
  bookingDate: string;
  startsAt: string;
  endsAt: string;
  durationMinutes: number;
  status: string;
  courtAmount: number;
  platformFee: number;
  voucherDiscount: number;
  finalAmount: number;
  isRefundEligible?: boolean;
  refundAmount?: number;
  refundPolicyReason?: string;
  payment?: { id: string; amount: number; status: string } | null;
  venue: { id: string; name: string; city: string };
  court: { id: string; name: string; type: string };
  host?: { id: string; name: string | null; email: string };
};

export type CreateBookingInput = {
  venueId: string;
  courtId: string;
  bookingDate: string;
  startsAt: string;
  endsAt: string;
};

export type BookingSummary = ApiBooking;

export type ApiAvailabilitySlot = {
  startsAt: string;
  endsAt: string;
  available: boolean;
  price: number;
  isPeak: boolean;
};

export type ApiAvailabilityCourt = {
  id: string;
  name: string;
  type: "INDOOR" | "OUTDOOR";
  slots: ApiAvailabilitySlot[];
};

export type ApiAvailabilityResponse = {
  date: string;
  timezone: string;
  courts: ApiAvailabilityCourt[];
};

type ApiPayment = {
  id: string;
  bookingId: string;
  amount: number;
  status: "PENDING" | "PAID" | "FAILED" | "REFUNDED" | string;
  provider: string;
  method: string;
  providerReference: string | null;
  providerToken: string | null;
  providerRedirectUrl: string | null;
  paidAt: string | null;
  failedAt: string | null;
  createdAt: string;
  updatedAt: string;
  booking: {
    id: string;
    bookingDate: string;
    startsAt: string;
    endsAt: string;
    durationMinutes: number;
    status: string;
    venue: { id: string; name: string; city: string };
    court: { id: string; name: string; type: string };
  };
};

export type CreatePaymentIntentInput = {
  bookingId: string;
  method: "va" | "ewallet" | "card";
};

export type PaymentSummary = ApiPayment;

type ApiInvite = {
  id: string;
  bookingId: string;
  userId: string | null;
  email: string;
  name: string;
  token: string;
  status: "PENDING" | "ACCEPTED" | "DECLINED" | "INVITED" | string;
  isHost: boolean;
  createdAt: string;
  updatedAt: string;
};

type ApiInviteDetails = ApiInvite & {
  booking: {
    id: string;
    bookingDate: string;
    startsAt: string;
    endsAt: string;
    status: string;
    venue: { id: string; name: string; city: string };
    court: { id: string; name: string; type: string };
    host: { id: string; name: string | null; email: string };
  };
};

export type InviteSummary = ApiInvite;
export type InviteDetails = ApiInviteDetails;

export type CreateInviteInput = {
  email: string;
};

export type RsvpInviteInput = {
  status: "ACCEPTED" | "DECLINED";
};

export type RefundStatus = "PENDING" | "APPROVED" | "REJECTED" | "PROCESSED";

export type ApiRefundEvent = {
  id: string;
  fromStatus: RefundStatus | null;
  toStatus: RefundStatus;
  actorUserId: string;
  notes: string | null;
  createdAt: string;
  actor: { id: string; name: string | null; email: string };
};

export type ApiRefund = {
  id: string;
  bookingId: string;
  paymentId: string | null;
  amount: number;
  reason: string;
  status: RefundStatus;
  adminNotes: string | null;
  processedAt: string | null;
  createdAt: string;
  updatedAt: string;
  booking?: {
    id: string;
    bookingDate: string;
    venue: { id: string; name: string };
    court: { id: string; name: string };
    host?: { id: string; name: string | null; email: string };
  };
};

export type CreateRefundInput = {
  bookingId: string;
  reason: string;
};

export type ProcessRefundInput = {
  adminNotes?: string;
};

export class ApiRequestError extends Error {
  constructor(
    message: string,
    readonly status?: number,
    readonly statusText?: string
  ) {
    super(message);
    this.name = "ApiRequestError";
  }
}

type ApiFetchOptions = RequestInit;

async function apiFetch<T>(path: string, options: ApiFetchOptions ={}): Promise<T> {
  const { headers, body, ...requestOptions } = options;
  
  let token: string | null = null;
  try {
    token = await getIdToken();
  } catch {
    // Ignore transient failures to allow public endpoints to continue
  }

  const isRevalidate = typeof requestOptions.next?.revalidate === "number";
  const response = await fetch(`${API_URL}${path}`, {
    ...requestOptions,
    headers: {
      Accept: "application/json",
      ...(body ? { "Content-Type": "application/json" } :{}),
      ...(token ? { Authorization: `Bearer ${token}` } :{}),
      ...headers,
    },
    body,
    ...(!isRevalidate && { cache: requestOptions.cache ?? "no-store" }),
  });

  if (!response.ok) {
    let message = `API request failed: ${response.status} ${response.statusText}`;
    try {
      const payload = (await response.json()) as { message?: string | string[] };
      if (Array.isArray(payload.message)) {
        message = payload.message.join(" ");
      } else if (payload.message) {
        message = payload.message;
      }
    } catch {
      // Keep HTTP status message when response body is not JSON.
    }
    throw new ApiRequestError(message, response.status, response.statusText);
  }

  return response.json() as Promise<T>;
}

function formatDate(value: string): string {
  return value.split("T")[0] ?? value;
}

function mapVenue(venue: ApiVenue): Venue {
  return {
    id: venue.id,
    ownerId: "api",
    name: venue.name,
    location: venue.location,
    city: venue.city,
    description: venue.description,
    imageUrl: venue.imageUrl ?? padelImg(600),
    photos:
      venue.photos.length > 0
        ? venue.photos
        : [padelImg(1200, 85), padelImg(600), padelImg(600)],
    facilities: venue.facilities,
    operatingHours: { open: venue.openTime, close: venue.closeTime },
    rating: Number(venue.rating),
    reviewCount: Number(venue.reviewCount),
    isVerified: venue.status === "APPROVED",
    createdAt: new Date().toISOString(),
  };
}

function mapCourt(court: ApiCourt, venueId: string): Court {
  return {
    id: court.id,
    venueId,
    name: court.name,
    type: court.type.toLowerCase() as Court["type"],
    pricing: {
      weekdayPeak: Number(court.weekdayPeak),
      weekdayOffPeak: Number(court.weekdayOffPeak),
      weekendPeak: Number(court.weekendPeak),
      weekendOffPeak: Number(court.weekendOffPeak),
    },
    isActive: court.isActive,
  };
}

function mapVoucher(voucher: ApiVoucher): Voucher {
  return {
    id: voucher.id,
    code: voucher.code,
    type: voucher.type === "PERCENTAGE" ? "percentage" : "nominal",
    value: voucher.value,
    minPurchase: voucher.minPurchase ?? undefined,
    maxDiscount: voucher.maxDiscount ?? undefined,
    usageLimit: voucher.usageLimit,
    usedCount: voucher.usedCount,
    validFrom: formatDate(voucher.validFrom),
    validUntil: formatDate(voucher.validUntil),
    isActive: voucher.isActive,
  };
}

export async function getVenues(opts?: { revalidate?: number; [key: string]: any }): Promise<Venue[]> {
  const options = typeof opts?.revalidate === "number" ? { next: { revalidate: opts.revalidate } } : {};
  const venues = await apiFetch<ApiVenue[]>("/venues", options);
  return venues.map(mapVenue);
}

export async function getVenue(id: string, opts?: { revalidate?: number }): Promise<Venue> {
  const options = typeof opts?.revalidate === "number" ? { next: { revalidate: opts.revalidate } } : {};
  const venue = await apiFetch<ApiVenue>(`/venues/${id}`, options);
  return mapVenue(venue);
}

export async function getVenueCourts(venueId: string, opts?: { revalidate?: number }): Promise<Court[]> {
  const options = typeof opts?.revalidate === "number" ? { next: { revalidate: opts.revalidate } } : {};
  const courts = await apiFetch<ApiCourt[]>(`/venues/${venueId}/courts`, options);
  return courts.map((court) => mapCourt(court, venueId));
}

export async function getVouchers(): Promise<Voucher[]> {
  const vouchers = await apiFetch<ApiVoucher[]>("/vouchers");
  return vouchers.map(mapVoucher);
}

export async function createBooking(
  input: CreateBookingInput
): Promise<BookingSummary> {
  return apiFetch<ApiBooking>("/bookings", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function cancelBooking(bookingId: string): Promise<BookingSummary> {
  return apiFetch<ApiBooking>(`/bookings/${bookingId}/cancel`, {
    method: "PATCH",
  });
}

export type BookingFilter = "upcoming" | "past" | "cancelled";

export async function getUserBookings(
  filter: BookingFilter
): Promise<ApiBooking[]> {
  return apiFetch<ApiBooking[]>(`/bookings/me?filter=${filter}`);
}

export async function getBookingById(id: string): Promise<BookingSummary> {
  return apiFetch<ApiBooking>(`/bookings/${id}`);
}

export async function getVenueAvailability(
  venueId: string,
  date: string,
  courtId?: string
): Promise<ApiAvailabilityResponse> {
  const query = new URLSearchParams();
  query.set("date", date);
  if (courtId) query.set("courtId", courtId);
  return apiFetch<ApiAvailabilityResponse>(`/venues/${venueId}/availability?${query.toString()}`);
}

export async function createPaymentIntent(
  input: CreatePaymentIntentInput
): Promise<PaymentSummary> {
  return apiFetch<ApiPayment>("/payments/intents", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function getPayment(id: string): Promise<PaymentSummary> {
  return apiFetch<ApiPayment>(`/payments/${id}`);
}

export async function markPaymentPaid(paymentId: string): Promise<PaymentSummary> {
  return apiFetch<ApiPayment>(`/payments/${paymentId}/mark-paid`, {
    method: "PATCH",
  });
}

export async function getInvite(token: string): Promise<InviteDetails> {
  return apiFetch<ApiInviteDetails>(`/invites/${token}`);
}

export async function getBookingInvites(bookingId: string): Promise<InviteSummary[]> {
  return apiFetch<ApiInvite[]>(`/bookings/${bookingId}/invites`);
}

export async function createBookingInvite(
  bookingId: string,
  input: CreateInviteInput
): Promise<InviteSummary> {
  return apiFetch<ApiInvite>(`/bookings/${bookingId}/invites`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function rsvpInvite(token: string, input: RsvpInviteInput): Promise<InviteSummary> {
  return apiFetch<ApiInvite>(`/invites/${token}/rsvp`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export async function createRefund(input: CreateRefundInput): Promise<ApiRefund> {
  return apiFetch<ApiRefund>("/refunds", { method: "POST", body: JSON.stringify(input) });
}

export async function getMyRefunds(): Promise<ApiRefund[]> {
  return apiFetch<ApiRefund[]>("/refunds/me");
}

export async function getRefunds(status?: RefundStatus): Promise<ApiRefund[]> {
  const query = status ? `?status=${status}` : "";
  return apiFetch<ApiRefund[]>(`/refunds${query}`);
}

export async function getRefundById(id: string): Promise<ApiRefund> {
  return apiFetch<ApiRefund>(`/refunds/${id}`);
}

export async function getRefundHistory(id: string): Promise<ApiRefundEvent[]> {
  return apiFetch<ApiRefundEvent[]>(`/refunds/${id}/history`);
}

export async function approveRefund(id: string, adminNotes?: string): Promise<ApiRefund> {
  return apiFetch<ApiRefund>(`/refunds/${id}/approve`, { method: "PATCH", body: JSON.stringify({ adminNotes }) });
}

export async function rejectRefund(id: string, adminNotes?: string): Promise<ApiRefund> {
  return apiFetch<ApiRefund>(`/refunds/${id}/reject`, { method: "PATCH", body: JSON.stringify({ adminNotes }) });
}

export async function processRefund(id: string): Promise<ApiRefund> {
  return apiFetch<ApiRefund>(`/refunds/${id}/process`, { method: "PATCH" });
}
