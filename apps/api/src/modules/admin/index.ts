import { Elysia } from "elysia";
import { authPlugin } from "../../plugins/auth";
import { ensureRoles } from "../../common/auth.util";
import { adminService } from "./service";
import { venuesService } from "../venues/service";
import { vouchersService } from "../vouchers/service";
import { disputesService } from "../disputes/service";
import { UserRole, VenueStatus, DisputeStatus } from "@prisma/client";
import {
  AdminBookingsQuerySchema,
  AdminVenuesQuerySchema,
  UpdateVenueStatusSchema,
  CommissionQuerySchema,
  DisputeAdminQuerySchema,
} from "./model";
import { CreateVoucherSchema, UpdateVoucherSchema } from "../vouchers/model";
import { ResolveDisputeSchema } from "../disputes/model";

export const adminModule = new Elysia({ prefix: "/admin", name: "adminModule" })
  .use(authPlugin)
  .get("/me", ({ user }) => {
    return ensureRoles(user, UserRole.SUPER_ADMIN);
  }, {
    detail: { summary: "Get super admin profile", tags: ["Admin"] },
  })
  .get("/overview", ({ user }) => {
    ensureRoles(user, UserRole.SUPER_ADMIN);
    return adminService.getOverview();
  }, {
    detail: { summary: "Platform overview metrics", tags: ["Admin"] },
  })
  .get("/bookings", ({ query, user }) => {
    const authed = ensureRoles(user, UserRole.SUPER_ADMIN, UserRole.VENUE_OWNER, UserRole.VENUE_ADMIN);
    return adminService.getBookings(query, authed);
  }, {
    query: AdminBookingsQuerySchema,
    detail: { summary: "List bookings for admin/owner", tags: ["Admin"] },
  })
  .get("/venues", ({ query, user }) => {
    ensureRoles(user, UserRole.SUPER_ADMIN);
    return venuesService.findVenuesForAdmin(query?.status as VenueStatus | undefined);
  }, {
    query: AdminVenuesQuerySchema,
    detail: { summary: "List all venues for super admin", tags: ["Admin"] },
  })
  .patch("/venues/:id/status", ({ params, body, user }) => {
    ensureRoles(user, UserRole.SUPER_ADMIN);
    return venuesService.setVenueStatus(params.id, body.status);
  }, {
    body: UpdateVenueStatusSchema,
    detail: { summary: "Update venue status (approve/reject/suspend)", tags: ["Admin"] },
  })
  .get("/commission", ({ query, user }) => {
    ensureRoles(user, UserRole.SUPER_ADMIN);
    return adminService.getCommission(query);
  }, {
    query: CommissionQuerySchema,
    detail: { summary: "Platform commission reports", tags: ["Admin"] },
  })
  .get("/metrics", ({ user }) => {
    ensureRoles(user, UserRole.SUPER_ADMIN);
    return adminService.getMetrics();
  }, {
    detail: { summary: "Platform metrics breakdown", tags: ["Admin"] },
  })
  .get("/vouchers", ({ user }) => {
    ensureRoles(user, UserRole.SUPER_ADMIN);
    return vouchersService.findAllForAdmin();
  }, {
    detail: { summary: "List all vouchers (admin)", tags: ["Admin"] },
  })
  .post("/vouchers", ({ body, user }) => {
    ensureRoles(user, UserRole.SUPER_ADMIN);
    return vouchersService.createVoucher(body);
  }, {
    body: CreateVoucherSchema,
    detail: { summary: "Create voucher (admin)", tags: ["Admin"] },
  })
  .patch("/vouchers/:id", ({ params, body, user }) => {
    ensureRoles(user, UserRole.SUPER_ADMIN);
    return vouchersService.updateVoucher(params.id, body);
  }, {
    body: UpdateVoucherSchema,
    detail: { summary: "Update voucher (admin)", tags: ["Admin"] },
  })
  .delete("/vouchers/:id", ({ params, user }) => {
    ensureRoles(user, UserRole.SUPER_ADMIN);
    return vouchersService.deleteVoucher(params.id);
  }, {
    detail: { summary: "Delete voucher (admin)", tags: ["Admin"] },
  })
  .get("/disputes", ({ query, user }) => {
    ensureRoles(user, UserRole.SUPER_ADMIN);
    return disputesService.findAllForAdmin(query?.status as DisputeStatus | undefined);
  }, {
    query: DisputeAdminQuerySchema,
    detail: { summary: "List all disputes (admin)", tags: ["Admin"] },
  })
  .patch("/disputes/:id/assign", ({ params, user }) => {
    const authed = ensureRoles(user, UserRole.SUPER_ADMIN);
    return disputesService.assignDispute(params.id, authed.id);
  }, {
    detail: { summary: "Assign dispute to admin", tags: ["Admin"] },
  })
  .patch("/disputes/:id/resolve", ({ params, body, user }) => {
    const authed = ensureRoles(user, UserRole.SUPER_ADMIN);
    return disputesService.resolveDispute(params.id, authed.id, body.resolutionNotes);
  }, {
    body: ResolveDisputeSchema,
    detail: { summary: "Resolve dispute (admin)", tags: ["Admin"] },
  })
  .patch("/disputes/:id/close", ({ params, user }) => {
    const authed = ensureRoles(user, UserRole.SUPER_ADMIN);
    return disputesService.closeDispute(params.id, authed.id);
  }, {
    detail: { summary: "Close dispute (admin)", tags: ["Admin"] },
  });
