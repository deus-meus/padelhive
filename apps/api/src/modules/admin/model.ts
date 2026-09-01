import { BookingStatus, DisputeStatus, VenueStatus } from "@prisma/client";
import { type Static, t } from "elysia";

export const BookingStatusEnum = t.Enum(BookingStatus);
export const VenueStatusEnum = t.Enum(VenueStatus);
export const DisputeStatusEnum = t.Enum(DisputeStatus);

export const AdminBookingsQuerySchema = t.Object({
  status: t.Optional(t.String()),
  venueId: t.Optional(t.String()),
  fromDate: t.Optional(t.String()),
  toDate: t.Optional(t.String()),
  page: t.Optional(t.String()),
  pageSize: t.Optional(t.String()),
});

export const AdminVenuesQuerySchema = t.Object({
  status: t.Optional(t.String()),
});

export const UpdateVenueStatusSchema = t.Object({
  status: VenueStatusEnum,
});

export const CommissionQuerySchema = t.Object({
  fromDate: t.Optional(t.String()),
  toDate: t.Optional(t.String()),
});

export const DisputeAdminQuerySchema = t.Object({
  status: t.Optional(t.String()),
});

export type AdminBookingsQueryInput = Static<typeof AdminBookingsQuerySchema>;
export type AdminVenuesQueryInput = Static<typeof AdminVenuesQuerySchema>;
export type UpdateVenueStatusInput = Static<typeof UpdateVenueStatusSchema>;
export type CommissionQueryInput = Static<typeof CommissionQuerySchema>;
export type DisputeAdminQueryInput = Static<typeof DisputeAdminQuerySchema>;
