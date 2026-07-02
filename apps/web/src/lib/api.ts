import { padelImg } from "@/lib/images";
import { formatShortDate } from "@/lib/format";
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
  courtCount?: number;
  priceFrom?: number;
  weeklyHours?: Record<string, { open: string; close: string; closed?: boolean }> | null;
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
  voucherCode?: string;
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

export function getApiErrorMessage(error: unknown): string {
  if (error instanceof ApiRequestError) {
    const status = error.status;
    if (status === 401 || status === 403) {
      return "Your session may have expired. Please sign in and try again.";
    }
    if (status === 404) {
      return "We couldn't find this data. It may have been moved or removed.";
    }
    if (status === 408 || status === 429) {
      return "The server is busy right now. Please wait a moment and try again.";
    }
    if (typeof status === "number" && status >= 500) {
      return "The server ran into a problem. Please try again in a moment.";
    }
    if (error.message && !error.message.startsWith("API request failed")) {
      return error.message;
    }
    return "Something went wrong while loading this data. Please try again.";
  }
  return "We couldn't reach the server. Check your connection and try again.";
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

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export async function getMe(): Promise<{ id: string; firebaseUid?: string; email: string; name: string; role: string; avatarUrl?: string }> {
  const me = await apiFetch<{ id: string; firebaseUid?: string; email: string; name: string; role: string; avatarUrl?: string }>("/auth/me");
  return { ...me, role: me.role.toLowerCase() };
}

export type UploadSignatureResponse = {
  timestamp: number;
  signature: string;
  apiKey: string;
  cloudName: string;
  folder: string;
};

export async function getUploadSignature(): Promise<UploadSignatureResponse> {
  return apiFetch<UploadSignatureResponse>("/uploads/signature", { method: "POST" });
}

export async function uploadVenueImage(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Please select an image file");
  }
  if (file.size > 5 * 1024 * 1024) {
    throw new Error("Image must be 5MB or smaller");
  }

  const sig = await getUploadSignature();
  
  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", sig.apiKey);
  formData.append("timestamp", sig.timestamp.toString());
  formData.append("signature", sig.signature);
  formData.append("folder", sig.folder);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Failed to upload image to Cloudinary");
  }

  const data = await response.json();
  return data.secure_url;
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
    weeklyHours: venue.weeklyHours ?? null,
    rating: Number(venue.rating),
    reviewCount: Number(venue.reviewCount),
    isVerified: venue.status === "APPROVED",
    status: venue.status as Venue["status"],
    createdAt: new Date().toISOString(),
    courtCount: venue.courtCount,
    priceFrom: venue.priceFrom,
  };
}

function mapVenueManage(venue: ApiVenue): Venue {
  return {
    ...mapVenue(venue),
    imageUrl: venue.imageUrl ?? "",
    photos: venue.photos,
    facilities: venue.facilities,
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
    validFrom: formatShortDate(voucher.validFrom),
    validUntil: formatShortDate(voucher.validUntil),
    isActive: voucher.isActive,
  };
}

export async function getVenues(params?: {
  q?: string;
  city?: string;
  priceMin?: number;
  priceMax?: number;
  rating?: number;
  type?: "INDOOR" | "OUTDOOR";
  facilities?: string[];
  revalidate?: number;
}): Promise<Venue[]> {
  const options = typeof params?.revalidate === "number" ? { next: { revalidate: params.revalidate } } : {};
  const query = new URLSearchParams();

  if (params?.q) query.set("q", params.q);
  if (params?.city && params.city !== "All") query.set("city", params.city);
  if (params?.priceMin !== undefined && params.priceMin !== null) query.set("priceMin", params.priceMin.toString());
  if (params?.priceMax !== undefined && params.priceMax !== null) query.set("priceMax", params.priceMax.toString());
  if (params?.rating !== undefined && params.rating !== null) query.set("rating", params.rating.toString());
  if (params?.type) query.set("type", params.type);
  if (params?.facilities && params.facilities.length > 0) query.set("facilities", params.facilities.join(","));

  const qs = query.toString();
  const endpoint = qs ? `/venues?${qs}` : "/venues";
  const venues = await apiFetch<ApiVenue[]>(endpoint, options);
  return venues.map(mapVenue);
}

export async function getVenue(id: string, opts?: { revalidate?: number }): Promise<Venue> {
  const options = typeof opts?.revalidate === "number" ? { next: { revalidate: opts.revalidate } } : {};
  const venue = await apiFetch<ApiVenue>(`/venues/${id}`, options);
  return mapVenue(venue);
}

export type VenueInput = {
  name: string;
  location: string;
  city: string;
  description: string;
  openTime: string;
  closeTime: string;
  imageUrl?: string;
  photos?: string[];
  facilities?: string[];
  weeklyHours?: Record<string, { open: string; close: string; closed?: boolean }>;
};

export type UpdateVenueInput = Partial<VenueInput>;

export async function getVenuesManage(): Promise<Venue[]> {
  const venues = await apiFetch<ApiVenue[]>("/venues/manage");
  return venues.map(mapVenueManage);
}

export async function createVenue(input: VenueInput): Promise<Venue> {
  const v = await apiFetch<ApiVenue>("/venues", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return mapVenue(v);
}

export async function updateVenue(id: string, input: UpdateVenueInput): Promise<Venue> {
  const v = await apiFetch<ApiVenue>(`/venues/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
  return mapVenue(v);
}

export async function getVenueCourts(venueId: string, opts?: { revalidate?: number }): Promise<Court[]> {
  const options = typeof opts?.revalidate === "number" ? { next: { revalidate: opts.revalidate } } : {};
  const courts = await apiFetch<ApiCourt[]>(`/venues/${venueId}/courts`, options);
  return courts.map((court) => mapCourt(court, venueId));
}

export type CreateCourtInput = {
  name: string;
  type: "INDOOR" | "OUTDOOR";
  weekdayPeak: number;
  weekdayOffPeak: number;
  weekendPeak: number;
  weekendOffPeak: number;
  isActive?: boolean;
};

export type UpdateCourtInput = Partial<CreateCourtInput>;

export async function getVenueCourtsManage(venueId: string): Promise<Court[]> {
  const courts = await apiFetch<ApiCourt[]>(`/venues/${venueId}/courts/manage`);
  return courts.map((c) => mapCourt(c, venueId));
}

export async function createCourt(venueId: string, input: CreateCourtInput): Promise<Court> {
  const c = await apiFetch<ApiCourt>(`/venues/${venueId}/courts`, {
    method: "POST",
    body: JSON.stringify(input),
  });
  return mapCourt(c, venueId);
}

export async function updateCourt(venueId: string, courtId: string, input: UpdateCourtInput): Promise<Court> {
  const c = await apiFetch<ApiCourt>(`/venues/${venueId}/courts/${courtId}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
  return mapCourt(c, venueId);
}

export async function getVouchers(): Promise<Voucher[]> {
  const vouchers = await apiFetch<ApiVoucher[]>("/vouchers");
  return vouchers.map(mapVoucher);
}

export type VoucherValidationResult = {
  code: string;
  type: "NOMINAL" | "PERCENTAGE";
  discount: number;
  finalAmount: number;
};

export async function validateVoucher(code: string, amount: number): Promise<VoucherValidationResult> {
  return apiFetch<VoucherValidationResult>("/vouchers/validate", {
    method: "POST",
    body: JSON.stringify({ code, amount }),
  });
}

export type AdminVoucher = {
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

export type AdminVoucherInput = {
  code: string;
  type: "NOMINAL" | "PERCENTAGE";
  value: number;
  minPurchase?: number | null;
  maxDiscount?: number | null;
  usageLimit: number;
  validFrom: string;
  validUntil: string;
  isActive?: boolean;
};

export async function getAdminVouchers(): Promise<AdminVoucher[]> {
  return apiFetch<AdminVoucher[]>("/admin/vouchers");
}

export async function createAdminVoucher(input: AdminVoucherInput): Promise<AdminVoucher> {
  return apiFetch<AdminVoucher>("/admin/vouchers", { method: "POST", body: JSON.stringify(input) });
}

export async function updateAdminVoucher(id: string, input: Partial<AdminVoucherInput>): Promise<AdminVoucher> {
  return apiFetch<AdminVoucher>(`/admin/vouchers/${id}`, { method: "PATCH", body: JSON.stringify(input) });
}

export async function deleteAdminVoucher(id: string): Promise<{ id: string }> {
  return apiFetch<{ id: string }>(`/admin/vouchers/${id}`, { method: "DELETE" });
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

export async function rescheduleBooking(bookingId: string, body: { bookingDate: string; startsAt: string; endsAt: string }): Promise<BookingSummary> {
  return apiFetch<ApiBooking>(`/bookings/${bookingId}/reschedule`, { method: "PATCH", body: JSON.stringify(body) });
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

export type ApiReview = {
  id: string;
  venueId: string;
  bookingId: string;
  rating: number;
  comment: string | null;
  authorId: string;
  authorName: string;
  authorAvatarUrl: string | null;
  createdAt: string;
};

export type ReviewSummary = ApiReview;

export type CreateReviewInput = {
  bookingId: string;
  rating: number;
  comment?: string;
};

export async function getVenueReviews(venueId: string): Promise<ReviewSummary[]> {
  return apiFetch<ApiReview[]>(`/reviews?venueId=${encodeURIComponent(venueId)}`);
}

export async function createReview(input: CreateReviewInput): Promise<ReviewSummary> {
  return apiFetch<ApiReview>("/reviews", {
    method: "POST",
    body: JSON.stringify(input),
  });
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

export type DisputeStatus = "OPEN" | "INVESTIGATING" | "RESOLVED" | "CLOSED";
export type DisputeIssueType = "COURT_UNAVAILABLE" | "FACILITY_MISMATCH" | "PAYMENT_ISSUE" | "SAFETY_CONCERN" | "STAFF_BEHAVIOR";
export type DisputePriority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type ApiDispute = {
  id: string;
  bookingId: string | null;
  issueType: DisputeIssueType;
  description: string;
  status: DisputeStatus;
  priority: DisputePriority;
  resolutionNotes: string | null;
  resolvedAt: string | null;
  createdAt: string;
  user: { id: string; name: string };
  venue: { id: string; name: string };
  assignedTo: { id: string; name: string } | null;
};

export async function getAdminDisputes(status?: DisputeStatus): Promise<ApiDispute[]> {
  const query = status ? `?status=${status}` : "";
  return apiFetch<ApiDispute[]>(`/admin/disputes${query}`);
}
export async function assignDispute(id: string): Promise<ApiDispute> {
  return apiFetch<ApiDispute>(`/admin/disputes/${id}/assign`, { method: "PATCH" });
}
export async function resolveDispute(id: string, resolutionNotes?: string): Promise<ApiDispute> {
  return apiFetch<ApiDispute>(`/admin/disputes/${id}/resolve`, { method: "PATCH", body: JSON.stringify({ resolutionNotes }) });
}
export async function closeDispute(id: string): Promise<ApiDispute> {
  return apiFetch<ApiDispute>(`/admin/disputes/${id}/close`, { method: "PATCH" });
}

export type CreatePlayerDisputeInput = {
  bookingId: string;
  issueType: DisputeIssueType;
  description: string;
  priority?: DisputePriority;
};
export async function createPlayerDispute(input: CreatePlayerDisputeInput): Promise<ApiDispute> {
  return apiFetch<ApiDispute>("/disputes", { method: "POST", body: JSON.stringify(input) });
}
export async function getMyDisputes(): Promise<ApiDispute[]> {
  return apiFetch<ApiDispute[]>("/disputes/me");
}

export type NotificationType =
  | "BOOKING_CONFIRMED" | "BOOKING_CANCELLED"
  | "PAYMENT_SUCCESS" | "PAYMENT_FAILED"
  | "REFUND_REQUESTED" | "REFUND_APPROVED" | "REFUND_REJECTED" | "REFUND_PROCESSED"
  | "DISPUTE_CREATED" | "DISPUTE_ASSIGNED" | "DISPUTE_RESOLVED" | "DISPUTE_CLOSED";

export type ApiNotification = {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  linkUrl: string | null;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
};

export async function getNotifications(): Promise<ApiNotification[]> {
  return apiFetch<ApiNotification[]>("/notifications");
}
export async function getUnreadNotificationCount(): Promise<number> {
  const res = await apiFetch<{ count: number }>("/notifications/unread-count");
  return res.count;
}
export async function markNotificationRead(id: string): Promise<ApiNotification> {
  return apiFetch<ApiNotification>(`/notifications/${id}/read`, { method: "PATCH" });
}
export async function markAllNotificationsRead(): Promise<{ updated: number }> {
  return apiFetch<{ updated: number }>("/notifications/read-all", { method: "PATCH" });
}

export type HomeStats = {
  players: number;
  venues: number;
  matchesThisMonth: number;
  hoursPlayed: number;
  cityCounts: { city: string; count: number }[];
};

export async function getHomeStats(opts?: { revalidate?: number }): Promise<HomeStats> {
  const options = typeof opts?.revalidate === "number" ? { next: { revalidate: opts.revalidate } } : {};
  return apiFetch<HomeStats>("/stats/home", options);
}

export type OwnerDashboard = {
  kpis: {
    weeklyRevenue: number;
    weeklyBookings: number;
    occupancyRate: number;
    activeCourts: number;
    pendingPayments: number;
  };
  revenueSeries: Array<{ date: string; label: string; value: number }>;
  courtUtilization: Array<{ courtId: string; name: string; occupancyRate: number }>;
  todaysSchedule: Array<{ bookingId: string; time: string; court: string; player: string; status: string }>;
  recentBookings: Array<{ id: string; venueName: string; courtName: string; bookingDate: string; time: string; finalAmount: number; status: string }>;
};

export async function getOwnerDashboard(): Promise<OwnerDashboard> {
  return apiFetch<OwnerDashboard>("/bookings/owner-dashboard");
}

export type OwnerRevenue = {
  monthlySeries: Array<{ month: string; value: number }>;
  weeklySeries: Array<{ day: string; value: number }>;
  kpis: {
    totalRevenue: number;
    totalBookings: number;
    avgBookingValue: number;
    uniquePlayers: number;
    cancellationRate: number;
    repeatCustomerRate: number;
  };
  topCourts: Array<{ courtId: string; name: string; venue: string; bookings: number; revenue: number }>;
};

export function getRevenue() {
  return apiFetch<OwnerRevenue>("/bookings/revenue");
}

export type AdminOverview = {
  gmv: number;
  commissionRevenue: number;
  totalBookings: number;
  activeVenues: number;
  pendingApprovals: number;
  refundRequests: number;
  paymentSuccessRate: number;
  avgBookingValue: number;
  avgCommissionRate: number;
};

export async function getAdminOverview(): Promise<AdminOverview> {
  return apiFetch<AdminOverview>("/admin/overview");
}

export type AdminBookingItem = {
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
  payment: { id: string; amount: number; status: string; provider: string; method: string } | null;
};

export type AdminBookingsResponse = {
  items: AdminBookingItem[];
  page: number;
  pageSize: number;
  total: number;
};

export type GetAdminBookingsParams = {
  status?: string;
  venueId?: string;
  fromDate?: string;
  toDate?: string;
  page?: number;
  pageSize?: number;
};

export async function getAdminBookings(params: GetAdminBookingsParams = {}): Promise<AdminBookingsResponse> {
  const q = new URLSearchParams();
  if (params.status) q.set("status", params.status);
  if (params.venueId) q.set("venueId", params.venueId);
  if (params.fromDate) q.set("fromDate", params.fromDate);
  if (params.toDate) q.set("toDate", params.toDate);
  if (params.page) q.set("page", String(params.page));
  if (params.pageSize) q.set("pageSize", String(params.pageSize));
  const qs = q.toString();
  return apiFetch<AdminBookingsResponse>(`/admin/bookings${qs ? `?${qs}` : ""}`);
}

type VenueStatusValue = "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED";

export async function getAdminVenues(status?: VenueStatusValue): Promise<Venue[]> {
  const q = status ? `?status=${status}` : "";
  const venues = await apiFetch<ApiVenue[]>(`/admin/venues${q}`);
  return venues.map(mapVenue);
}

export async function updateVenueStatus(id: string, status: VenueStatusValue): Promise<Venue> {
  const v = await apiFetch<ApiVenue>(`/admin/venues/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
  return mapVenue(v);
}

export interface CommissionVenueRow { venueId: string; venueName: string; city: string; commissionRate: number; bookings: number; gmv: number; commission: number; effectiveRate: number; }
export interface CommissionReport { totalCommission: number; totalGmv: number; totalBookings: number; avgCommissionRate: number; venues: CommissionVenueRow[]; }
export interface GetCommissionParams { fromDate?: string; toDate?: string; }
export async function getCommissionReport(params: GetCommissionParams = {}): Promise<CommissionReport> {
  const sp = new URLSearchParams();
  if (params.fromDate) sp.set("fromDate", params.fromDate);
  if (params.toDate) sp.set("toDate", params.toDate);
  const qs = sp.toString();
  return apiFetch<CommissionReport>(`/admin/commission${qs ? `?${qs}` : ""}`);
}

export interface AdminMetricsMonth { month: string; gmv: number; commission: number; bookings: number; }
export interface AdminMetricsStatus { status: string; count: number; }
export interface AdminMetrics { totalGmv: number; totalCommission: number; totalBookings: number; avgMonthlyGmv: number; monthlySeries: AdminMetricsMonth[]; statusBreakdown: AdminMetricsStatus[]; }

export async function getAdminMetrics(): Promise<AdminMetrics> {
  return apiFetch<AdminMetrics>("/admin/metrics");
}

export type SplitShareStatus = "PENDING" | "PAID" | "REFUNDED";
export type BookingSplitShare = { id: string; name: string; email: string | null; userId: string | null; inviteId: string | null; amount: number; status: SplitShareStatus; paidAt: string | null; refundedAt?: string | null };
export type BookingSplit = { bookingId: string; totalAmount: number; splitTotal: number; paidAmount: number; shareCount: number; shares: BookingSplitShare[] };
export type SplitParticipantInput = { name: string; email?: string; userId?: string; inviteId?: string; amount?: number };
export type SetBookingSplitInput = { mode: "equal" | "custom"; participants: SplitParticipantInput[] };

export type SharePaymentIntent = {
  shareId: string;
  amount: number;
  provider: string;
  method: string;
  providerReference: string;
  redirectUrl: string | null;
  token: string | null;
};

export async function getBookingSplit(bookingId: string): Promise<BookingSplit> {
  return apiFetch<BookingSplit>(`/bookings/${bookingId}/split`);
}

export async function setBookingSplit(bookingId: string, input: SetBookingSplitInput): Promise<BookingSplit> {
  return apiFetch<BookingSplit>(`/bookings/${bookingId}/split`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
}

export async function clearBookingSplit(bookingId: string): Promise<void> {
  return apiFetch<void>(`/bookings/${bookingId}/split`, {
    method: "DELETE",
  });
}

export async function setSplitShareStatus(bookingId: string, shareId: string, status: SplitShareStatus): Promise<BookingSplit> {
  return apiFetch<BookingSplit>(`/bookings/${bookingId}/split/${shareId}`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export async function createSharePaymentIntent(bookingId: string, shareId: string, method: "va" | "ewallet" | "card"): Promise<SharePaymentIntent> {
  return apiFetch<SharePaymentIntent>(`/bookings/${bookingId}/split/${shareId}/pay`, {
    method: "POST",
    body: JSON.stringify({ method }),
  });
}
