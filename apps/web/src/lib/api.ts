import { padelImg } from "@/lib/images";
import { Court, Venue, Voucher } from "@/types";

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

type ApiBooking = {
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
  venue: { id: string; name: string; city: string };
  court: { id: string; name: string; type: string };
  host: { id: string; name: string | null; email: string };
};

export type CreateBookingInput = {
  venueId: string;
  courtId: string;
  bookingDate: string;
  startsAt: string;
  endsAt: string;
};

export type BookingSummary = ApiBooking;

type ApiPayment = {
  id: string;
  bookingId: string;
  amount: number;
  status: "PENDING" | "PAID" | "FAILED" | "REFUNDED" | string;
  provider: string;
  method: string;
  providerReference: string | null;
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

type ApiFetchOptions = RequestInit & {
  authToken?: string;
};

async function apiFetch<T>(path: string, options: ApiFetchOptions ={}): Promise<T> {
  const { authToken, headers, body, ...requestOptions } = options;
  const response = await fetch(`${API_URL}${path}`, {
    ...requestOptions,
    headers: {
      Accept: "application/json",
      ...(body ? { "Content-Type": "application/json" } :{}),
      ...(authToken ? { Authorization: `Bearer ${authToken}` } :{}),
      ...headers,
    },
    body,
    cache: requestOptions.cache ?? "no-store",
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
    rating: venue.rating,
    reviewCount: venue.reviewCount,
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
      weekdayPeak: court.weekdayPeak,
      weekdayOffPeak: court.weekdayOffPeak,
      weekendPeak: court.weekendPeak,
      weekendOffPeak: court.weekendOffPeak,
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

export async function getVenues(): Promise<Venue[]> {
  const venues = await apiFetch<ApiVenue[]>("/venues");
  return venues.map(mapVenue);
}

export async function getVenue(id: string): Promise<Venue> {
  const venue = await apiFetch<ApiVenue>(`/venues/${id}`);
  return mapVenue(venue);
}

export async function getVenueCourts(venueId: string): Promise<Court[]> {
  const courts = await apiFetch<ApiCourt[]>(`/venues/${venueId}/courts`);
  return courts.map((court) => mapCourt(court, venueId));
}

export async function getVouchers(): Promise<Voucher[]> {
  const vouchers = await apiFetch<ApiVoucher[]>("/vouchers");
  return vouchers.map(mapVoucher);
}

export async function createBooking(
  input: CreateBookingInput,
  authToken: string
): Promise<BookingSummary> {
  return apiFetch<ApiBooking>("/bookings", {
    method: "POST",
    authToken,
    body: JSON.stringify(input),
  });
}

export async function createPaymentIntent(
  input: CreatePaymentIntentInput,
  authToken: string
): Promise<PaymentSummary> {
  return apiFetch<ApiPayment>("/payments/intents", {
    method: "POST",
    authToken,
    body: JSON.stringify(input),
  });
}

export async function getPayment(id: string, authToken: string): Promise<PaymentSummary> {
  return apiFetch<ApiPayment>(`/payments/${id}`, { authToken });
}

export async function getInvite(token: string): Promise<InviteDetails> {
  return apiFetch<ApiInviteDetails>(`/invites/${token}`);
}

export async function getBookingInvites(bookingId: string, authToken: string): Promise<InviteSummary[]> {
  return apiFetch<ApiInvite[]>(`/bookings/${bookingId}/invites`, { authToken });
}

export async function createBookingInvite(
  bookingId: string,
  input: CreateInviteInput,
  authToken: string
): Promise<InviteSummary> {
  return apiFetch<ApiInvite>(`/bookings/${bookingId}/invites`, {
    method: "POST",
    authToken,
    body: JSON.stringify(input),
  });
}

export async function rsvpInvite(token: string, input: RsvpInviteInput): Promise<InviteSummary> {
  return apiFetch<ApiInvite>(`/invites/${token}/rsvp`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}
