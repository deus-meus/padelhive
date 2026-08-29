import { t, Static } from "elysia";

export const CreateReviewSchema = t.Object({
  bookingId: t.String(),
  rating: t.Number({ minimum: 1, maximum: 5 }),
  comment: t.Optional(t.String()),
});

export const ReviewQuerySchema = t.Object({
  venueId: t.String(),
});

export type CreateReviewInput = Static<typeof CreateReviewSchema>;
export type ReviewQueryInput = Static<typeof ReviewQuerySchema>;
