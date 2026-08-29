import { Elysia } from "elysia";
import { authPlugin } from "../../plugins/auth";
import { ensureAuth } from "../../common/auth.util";
import { reviewsService } from "./service";
import { CreateReviewSchema, ReviewQuerySchema } from "./model";

export const reviewsModule = new Elysia({ prefix: "/reviews", name: "reviewsModule" })
  .use(authPlugin)
  .get("/", ({ query }) => {
    return reviewsService.findVenueReviews(query.venueId);
  }, {
    query: ReviewQuerySchema,
    detail: { summary: "List reviews for a venue", tags: ["Reviews"] },
  })
  .post("/", ({ body, user }) => {
    const authed = ensureAuth(user);
    return reviewsService.createReview(authed.id, body);
  }, {
    body: CreateReviewSchema,
    detail: { summary: "Submit review for completed booking", tags: ["Reviews"] },
  });
