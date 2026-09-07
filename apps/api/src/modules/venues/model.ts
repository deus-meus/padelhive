import { CourtType, VenueStatus } from "@prisma/client";
import { type Static, t } from "elysia";

export const VenueStatusEnum = t.Enum(VenueStatus);
export const CourtTypeEnum = t.Enum(CourtType);

export const WeeklyHoursSchema = t.Nullable(
  t.Record(
    t.String(),
    t.Object({
      open: t.Optional(t.String()),
      close: t.Optional(t.String()),
      closed: t.Optional(t.Boolean()),
    }),
  ),
);

export const CreateVenueSchema = t.Object({
  name: t.String(),
  location: t.String(),
  city: t.String(),
  latitude: t.Optional(t.Nullable(t.Number())),
  longitude: t.Optional(t.Nullable(t.Number())),
  description: t.String(),
  openTime: t.String(),
  closeTime: t.String(),
  imageUrl: t.Optional(t.String()),
  photos: t.Optional(t.Array(t.String())),
  facilities: t.Optional(t.Array(t.String())),
  weeklyHours: t.Optional(WeeklyHoursSchema),
});

export const UpdateVenueSchema = t.Partial(CreateVenueSchema);

export const VenueFilterSchema = t.Object({
  q: t.Optional(t.String()),
  city: t.Optional(t.String()),
  priceMin: t.Optional(t.String()),
  priceMax: t.Optional(t.String()),
  rating: t.Optional(t.String()),
  facilities: t.Optional(t.String()),
  type: t.Optional(t.String()),
});

export const AvailabilityQuerySchema = t.Object({
  date: t.String(),
  courtId: t.Optional(t.String()),
});

export const VenueResponseSchema = t.Object(
  {
    id: t.Optional(t.String()),
    ownerId: t.Optional(t.String()),
    name: t.Optional(t.String()),
    location: t.Optional(t.String()),
    city: t.Optional(t.String()),
    latitude: t.Optional(t.Nullable(t.Number())),
    longitude: t.Optional(t.Nullable(t.Number())),
    description: t.Optional(t.String()),
    openTime: t.Optional(t.String()),
    closeTime: t.Optional(t.String()),
    imageUrl: t.Optional(t.Nullable(t.String())),
    photos: t.Optional(t.Array(t.String())),
    facilities: t.Optional(t.Array(t.String())),
    weeklyHours: t.Optional(t.Any()),
    status: t.Optional(t.String()),
    priceFrom: t.Optional(t.Nullable(t.Number())),
    rating: t.Optional(t.Nullable(t.Number())),
    reviewCount: t.Optional(t.Number()),
    courtCount: t.Optional(t.Number()),
    createdAt: t.Optional(t.Any()),
    updatedAt: t.Optional(t.Any()),
  },
  { additionalProperties: true },
);

export const SlotSchema = t.Object({
  startsAt: t.String(),
  endsAt: t.String(),
  available: t.Boolean(),
  price: t.Number(),
  isPeak: t.Boolean(),
});

export const CourtAvailabilitySchema = t.Object({
  id: t.String(),
  name: t.String(),
  type: CourtTypeEnum,
  slots: t.Array(SlotSchema),
});

export const AvailabilityResponseSchema = t.Object({
  date: t.String(),
  timezone: t.String(),
  courts: t.Array(CourtAvailabilitySchema),
});

export type CreateVenueInput = Static<typeof CreateVenueSchema>;
export type UpdateVenueInput = Static<typeof UpdateVenueSchema>;
export type VenueFilterInput = Static<typeof VenueFilterSchema>;
export type AvailabilityQueryInput = Static<typeof AvailabilityQuerySchema>;
