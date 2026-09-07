import { BookingStatus, SplitShareStatus } from "@prisma/client";
import { type Static, t } from "elysia";

export const BookingStatusEnum = t.Enum(BookingStatus);
export const SplitShareStatusEnum = t.Enum(SplitShareStatus);

export const CreateBookingSchema = t.Object({
  venueId: t.String(),
  courtId: t.String(),
  bookingDate: t.String(),
  startsAt: t.String(),
  endsAt: t.String(),
  voucherCode: t.Optional(t.String()),
  hasInsurance: t.Optional(t.Boolean()),
});

export const RescheduleBookingSchema = t.Object({
  bookingDate: t.String(),
  startsAt: t.String(),
  endsAt: t.String(),
});

export const SplitParticipantSchema = t.Object({
  name: t.String(),
  email: t.Optional(t.String()),
  userId: t.Optional(t.String()),
  inviteId: t.Optional(t.String()),
  amount: t.Optional(t.Number()),
});

export const SetBookingSplitSchema = t.Object({
  mode: t.Union([t.Literal("equal"), t.Literal("custom")]),
  participants: t.Array(SplitParticipantSchema),
});

export const UpdateSplitShareStatusSchema = t.Object({
  status: t.Union([t.Literal("PENDING"), t.Literal("PAID")]),
});

export const CreateSharePaymentSchema = t.Object({
  method: t.Union([t.Literal("va"), t.Literal("ewallet"), t.Literal("card")]),
});

export const CreateChargePaymentSchema = t.Object({
  method: t.String(),
});

export const BookingResponseSchema = t.Object(
  {
    id: t.Optional(t.String()),
    userId: t.Optional(t.String()),
    venueId: t.Optional(t.String()),
    courtId: t.Optional(t.String()),
    bookingDate: t.Optional(t.Any()),
    startsAt: t.Optional(t.Any()),
    endsAt: t.Optional(t.Any()),
    totalPrice: t.Optional(t.Number()),
    subtotal: t.Optional(t.Number()),
    status: t.Optional(BookingStatusEnum),
    venue: t.Optional(t.Any()),
    court: t.Optional(t.Any()),
    user: t.Optional(t.Any()),
    createdAt: t.Optional(t.Any()),
    updatedAt: t.Optional(t.Any()),
  },
  { additionalProperties: true },
);

export const OwnerDashboardSchema = t.Object(
  {
    kpis: t.Optional(t.Any()),
    revenueSeries: t.Optional(t.Array(t.Any())),
    courtUtilization: t.Optional(t.Array(t.Any())),
    todaysSchedule: t.Optional(t.Array(t.Any())),
    recentBookings: t.Optional(t.Array(t.Any())),
  },
  { additionalProperties: true },
);

export const RevenueAnalyticsSchema = t.Object(
  {
    monthlySeries: t.Optional(t.Array(t.Any())),
    weeklySeries: t.Optional(t.Array(t.Any())),
    kpis: t.Optional(t.Any()),
    topCourts: t.Optional(t.Array(t.Any())),
  },
  { additionalProperties: true },
);

export type CreateBookingInput = Static<typeof CreateBookingSchema>;
export type RescheduleBookingInput = Static<typeof RescheduleBookingSchema>;
export type SetBookingSplitInput = Static<typeof SetBookingSplitSchema>;
export type UpdateSplitShareStatusInput = Static<
  typeof UpdateSplitShareStatusSchema
>;
export type CreateSharePaymentInput = Static<typeof CreateSharePaymentSchema>;
export type CreateChargePaymentInput = Static<typeof CreateChargePaymentSchema>;
