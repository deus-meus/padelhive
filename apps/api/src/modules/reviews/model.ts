import { type Static, t } from "elysia";

export const CreateReviewSchema = t.Object({
  bookingId: t.String(),
  rating: t.Number({ minimum: 1, maximum: 5 }),
  comment: t.Optional(t.String()),
});

export const ReviewQuerySchema = t.Object({
  venueId: t.String(),
});

export const ReviewResponseSchema = t.Object(
  {
    id: t.Optional(t.String()),
    venueId: t.Optional(t.String()),
    bookingId: t.Optional(t.String()),
    userId: t.Optional(t.String()),
    rating: t.Optional(t.Number()),
    comment: t.Optional(t.Nullable(t.String())),
    user: t.Optional(t.Any()),
    createdAt: t.Optional(t.Any()),
    updatedAt: t.Optional(t.Any()),
  },
  { additionalProperties: true },
);

export type CreateReviewInput = Static<typeof CreateReviewSchema>;
export type ReviewQueryInput = Static<typeof ReviewQuerySchema>;
