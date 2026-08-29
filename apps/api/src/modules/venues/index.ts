import { Elysia } from "elysia";
import { authPlugin } from "../../plugins/auth";
import { ensureRoles } from "../../common/auth.util";
import { venuesService, availabilityService } from "./service";
import { UserRole } from "@prisma/client";
import { CreateVenueSchema, UpdateVenueSchema, VenueFilterSchema, AvailabilityQuerySchema } from "./model";

export const venuesModule = new Elysia({ prefix: "/venues", name: "venuesModule" })
  .use(authPlugin)
  .get("/manage", ({ user }) => {
    const authed = ensureRoles(user, UserRole.VENUE_OWNER, UserRole.VENUE_ADMIN, UserRole.SUPER_ADMIN);
    return venuesService.findVenuesForManagement(authed.id, authed.role === UserRole.SUPER_ADMIN);
  }, {
    detail: { summary: "List venues for management", tags: ["Venues"] },
  })
  .get("/:id/availability", ({ params, query }) => {
    return availabilityService.getVenueAvailability(params.id, query.date, query.courtId);
  }, {
    query: AvailabilityQuerySchema,
    detail: { summary: "Get venue availability calendar", tags: ["Venues"] },
  })
  .get("/", ({ query }) => {
    return venuesService.findApprovedVenues(query);
  }, {
    query: VenueFilterSchema,
    detail: { summary: "List approved venues with filters", tags: ["Venues"] },
  })
  .post("/", ({ body, user }) => {
    const authed = ensureRoles(user, UserRole.VENUE_OWNER, UserRole.SUPER_ADMIN);
    return venuesService.createVenue(authed.id, body);
  }, {
    body: CreateVenueSchema,
    detail: { summary: "Create new venue", tags: ["Venues"] },
  })
  .get("/:id", ({ params }) => {
    return venuesService.findApprovedVenueById(params.id);
  }, {
    detail: { summary: "Get venue details by ID", tags: ["Venues"] },
  })
  .patch("/:id", ({ params, body, user }) => {
    const authed = ensureRoles(user, UserRole.VENUE_OWNER, UserRole.VENUE_ADMIN, UserRole.SUPER_ADMIN);
    return venuesService.updateVenue(params.id, authed.id, authed.role === UserRole.SUPER_ADMIN, body);
  }, {
    body: UpdateVenueSchema,
    detail: { summary: "Update venue details", tags: ["Venues"] },
  });
