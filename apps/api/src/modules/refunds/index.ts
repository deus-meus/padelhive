import { Elysia } from "elysia";
import { authPlugin } from "../../plugins/auth";
import { ensureAuth, ensureRoles } from "../../common/auth.util";
import { refundsService } from "./service";
import { UserRole, RefundStatus } from "@prisma/client";
import { CreateRefundSchema, AdminNotesSchema, RejectRefundSchema, RefundQuerySchema } from "./model";

export const refundsModule = new Elysia({ prefix: "/refunds", name: "refundsModule" })
  .use(authPlugin)
  .post("/", ({ body, user }) => {
    const authed = ensureAuth(user);
    return refundsService.createRefund(authed.id, body);
  }, {
    body: CreateRefundSchema,
    detail: { summary: "Create a refund request", tags: ["Refunds"] },
  })
  .get("/me", ({ user }) => {
    const authed = ensureAuth(user);
    return refundsService.findMyRefunds(authed.id);
  }, {
    detail: { summary: "List current user's refunds", tags: ["Refunds"] },
  })
  .get("/", ({ query, user }) => {
    const authed = ensureRoles(user, UserRole.SUPER_ADMIN, UserRole.VENUE_OWNER, UserRole.VENUE_ADMIN);
    const isSuperAdmin = authed.role === UserRole.SUPER_ADMIN;
    return refundsService.findAllRefunds(authed.id, isSuperAdmin, query.status as RefundStatus | undefined);
  }, {
    query: RefundQuerySchema,
    detail: { summary: "List refunds for admin/owner", tags: ["Refunds"] },
  })
  .get("/:id", ({ params, user }) => {
    const authed = ensureAuth(user);
    const isSuperAdmin = authed.role === UserRole.SUPER_ADMIN;
    return refundsService.findRefundById(params.id, authed.id, isSuperAdmin);
  }, {
    detail: { summary: "Get refund details by ID", tags: ["Refunds"] },
  })
  .get("/:id/history", ({ params, user }) => {
    const authed = ensureAuth(user);
    const isSuperAdmin = authed.role === UserRole.SUPER_ADMIN;
    return refundsService.findRefundHistory(params.id, authed.id, isSuperAdmin);
  }, {
    detail: { summary: "Get refund state transition history", tags: ["Refunds"] },
  })
  .patch("/:id/approve", ({ params, body, user }) => {
    const authed = ensureRoles(user, UserRole.SUPER_ADMIN, UserRole.VENUE_OWNER, UserRole.VENUE_ADMIN);
    const isSuperAdmin = authed.role === UserRole.SUPER_ADMIN;
    return refundsService.approveRefund(params.id, authed.id, isSuperAdmin, body.adminNotes);
  }, {
    body: AdminNotesSchema,
    detail: { summary: "Approve a refund request", tags: ["Refunds"] },
  })
  .patch("/:id/reject", ({ params, body, user }) => {
    const authed = ensureRoles(user, UserRole.SUPER_ADMIN, UserRole.VENUE_OWNER, UserRole.VENUE_ADMIN);
    const isSuperAdmin = authed.role === UserRole.SUPER_ADMIN;
    return refundsService.rejectRefund(params.id, authed.id, isSuperAdmin, body.adminNotes);
  }, {
    body: RejectRefundSchema,
    detail: { summary: "Reject a refund request", tags: ["Refunds"] },
  })
  .patch("/:id/process", ({ params, user }) => {
    const authed = ensureRoles(user, UserRole.SUPER_ADMIN, UserRole.VENUE_OWNER, UserRole.VENUE_ADMIN);
    const isSuperAdmin = authed.role === UserRole.SUPER_ADMIN;
    return refundsService.processRefund(params.id, authed.id, isSuperAdmin);
  }, {
    detail: { summary: "Process an approved refund", tags: ["Refunds"] },
  });
