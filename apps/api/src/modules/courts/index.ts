import { Elysia } from "elysia";
import { authPlugin } from "../../plugins/auth";
import { ensureRoles } from "../../common/auth.util";
import { courtsService } from "./service";
import { UserRole } from "@prisma/client";
import { CreateCourtSchema, UpdateCourtSchema } from "./model";

export const courtsModule = new Elysia({ prefix: "/venues/:venueId/courts", name: "courtsModule" })
  .use(authPlugin)
  .get("/manage", ({ params, user }) => {
    const authed = ensureRoles(user, UserRole.VENUE_OWNER, UserRole.VENUE_ADMIN, UserRole.SUPER_ADMIN);
    return courtsService.findCourtsForManagement(params.venueId, authed.id, authed.role === UserRole.SUPER_ADMIN);
  }, {
    detail: { summary: "List courts for management", tags: ["Courts"] },
  })
  .post("/", ({ params, body, user }) => {
    const authed = ensureRoles(user, UserRole.VENUE_OWNER, UserRole.VENUE_ADMIN, UserRole.SUPER_ADMIN);
    return courtsService.createCourt(params.venueId, authed.id, authed.role === UserRole.SUPER_ADMIN, body);
  }, {
    body: CreateCourtSchema,
    detail: { summary: "Create new court in venue", tags: ["Courts"] },
  })
  .patch("/:courtId", ({ params, body, user }) => {
    const authed = ensureRoles(user, UserRole.VENUE_OWNER, UserRole.VENUE_ADMIN, UserRole.SUPER_ADMIN);
    return courtsService.updateCourt(params.venueId, params.courtId, authed.id, authed.role === UserRole.SUPER_ADMIN, body);
  }, {
    body: UpdateCourtSchema,
    detail: { summary: "Update court details", tags: ["Courts"] },
  })
  .get("/", ({ params }) => {
    return courtsService.findActiveCourtsForApprovedVenue(params.venueId);
  }, {
    detail: { summary: "List active courts for venue", tags: ["Courts"] },
  });
