import { Elysia, t } from "elysia";
import { authPlugin } from "../../plugins/auth";
import { ensureAuth, ensureRoles } from "../../common/auth.util";
import { bookingsService } from "./service";
import { bookingSplitService } from "./split.service";
import { bookingChargeService } from "./charge.service";
import { UserRole } from "@prisma/client";
import {
  CreateBookingSchema,
  RescheduleBookingSchema,
  SetBookingSplitSchema,
  UpdateSplitShareStatusSchema,
  CreateSharePaymentSchema,
  CreateChargePaymentSchema,
} from "./model";

export const bookingsModule = new Elysia({ prefix: "/bookings", name: "bookingsModule" })
  .use(authPlugin)
  .post("/", ({ body, user }) => {
    const authed = ensureAuth(user);
    return bookingsService.createBookingForUser(authed.id, body);
  }, {
    body: CreateBookingSchema,
    detail: { summary: "Create pending booking", tags: ["Bookings"] },
  })
  .get("/owner-dashboard", ({ user }) => {
    const authed = ensureRoles(user, UserRole.VENUE_OWNER, UserRole.VENUE_ADMIN, UserRole.SUPER_ADMIN);
    return bookingsService.getOwnerDashboard(authed.id, authed.role === UserRole.SUPER_ADMIN);
  }, {
    detail: { summary: "Get venue owner dashboard summary", tags: ["Bookings"] },
  })
  .get("/revenue", ({ user }) => {
    const authed = ensureRoles(user, UserRole.VENUE_OWNER, UserRole.VENUE_ADMIN, UserRole.SUPER_ADMIN);
    return bookingsService.getRevenue(authed.id, authed.role === UserRole.SUPER_ADMIN);
  }, {
    detail: { summary: "Get venue revenue analytics", tags: ["Bookings"] },
  })
  .get("/me", ({ query, user }) => {
    const authed = ensureAuth(user);
    const filter = (query?.filter as "upcoming" | "past" | "cancelled") || "upcoming";
    return bookingsService.findBookingsForUser(authed.id, filter);
  }, {
    query: t.Optional(t.Object({ filter: t.Optional(t.String()) })),
    detail: { summary: "List current user's bookings", tags: ["Bookings"] },
  })
  .get("/:id", ({ params, user }) => {
    const authed = ensureAuth(user);
    return bookingsService.findBookingForUser(params.id, authed.id);
  }, {
    detail: { summary: "Get booking details by ID", tags: ["Bookings"] },
  })
  .patch("/:id/cancel", ({ params, user }) => {
    const authed = ensureAuth(user);
    return bookingsService.cancelBookingForUser(params.id, authed.id);
  }, {
    detail: { summary: "Cancel booking and determine refund", tags: ["Bookings"] },
  })
  .patch("/:id/reschedule", ({ params, body, user }) => {
    const authed = ensureAuth(user);
    return bookingsService.rescheduleBookingForUser(params.id, authed.id, body);
  }, {
    body: RescheduleBookingSchema,
    detail: { summary: "Reschedule booking time on same court", tags: ["Bookings"] },
  })
  .get("/:id/split", ({ params, user }) => {
    const authed = ensureAuth(user);
    return bookingSplitService.getSplit(params.id, authed.id);
  }, {
    detail: { summary: "Get split payment ledger", tags: ["Bookings"] },
  })
  .put("/:id/split", ({ params, body, user }) => {
    const authed = ensureAuth(user);
    return bookingSplitService.setSplit(params.id, authed.id, body);
  }, {
    body: SetBookingSplitSchema,
    detail: { summary: "Set split payment participants and amounts", tags: ["Bookings"] },
  })
  .delete("/:id/split", async ({ params, user, set }) => {
    const authed = ensureAuth(user);
    await bookingSplitService.clearSplit(params.id, authed.id);
    set.status = 204;
    return;
  }, {
    detail: { summary: "Clear split payment ledger", tags: ["Bookings"] },
  })
  .patch("/:id/split/:shareId", ({ params, body, user }) => {
    const authed = ensureAuth(user);
    return bookingSplitService.setShareStatus(params.id, params.shareId, authed.id, body.status);
  }, {
    body: UpdateSplitShareStatusSchema,
    detail: { summary: "Update split share status", tags: ["Bookings"] },
  })
  .post("/:id/split/:shareId/pay", ({ params, body, user }) => {
    const authed = ensureAuth(user);
    return bookingSplitService.createSharePaymentIntent(params.id, params.shareId, authed.id, body.method);
  }, {
    body: CreateSharePaymentSchema,
    detail: { summary: "Create payment intent for a split share", tags: ["Bookings"] },
  })
  .post("/:id/charge/pay", ({ params, body, user }) => {
    const authed = ensureAuth(user);
    return bookingChargeService.createChargeIntent(params.id, authed.id, body.method);
  }, {
    body: CreateChargePaymentSchema,
    detail: { summary: "Create payment intent for reschedule difference", tags: ["Bookings"] },
  })
  .patch("/:id/charge/mark-paid", ({ params, user }) => {
    const authed = ensureAuth(user);
    return bookingChargeService.markChargePaidForUser(params.id, authed.id);
  }, {
    detail: { summary: "Mark reschedule charge as paid (demo)", tags: ["Bookings"] },
  });
