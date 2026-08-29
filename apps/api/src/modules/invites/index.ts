import { Elysia } from "elysia";
import { ensureAuth } from "../../common/auth.util";
import { authPlugin } from "../../plugins/auth";
import { CreateInviteSchema, RsvpInviteSchema } from "./model";
import { invitesService } from "./service";

export const invitesModule = new Elysia({ name: "invitesModule" })
  .use(authPlugin)
  .post(
    "/bookings/:bookingId/invites",
    ({ params, body, user }) => {
      const authed = ensureAuth(user);
      return invitesService.createInviteForBooking(
        authed.id,
        params.bookingId,
        body,
      );
    },
    {
      body: CreateInviteSchema,
      detail: {
        summary: "Create player invite for booking",
        tags: ["Invites"],
      },
    },
  )
  .get(
    "/bookings/:bookingId/invites",
    ({ params, user }) => {
      const authed = ensureAuth(user);
      return invitesService.listInvitesForBooking(authed.id, params.bookingId);
    },
    {
      detail: { summary: "List invites for booking", tags: ["Invites"] },
    },
  )
  .get(
    "/invites/:token",
    ({ params }) => {
      return invitesService.getInviteByToken(params.token);
    },
    {
      detail: {
        summary: "Get public invite details by token",
        tags: ["Invites"],
      },
    },
  )
  .patch(
    "/invites/:token/rsvp",
    ({ params, body }) => {
      return invitesService.rsvpByToken(params.token, body);
    },
    {
      body: RsvpInviteSchema,
      detail: { summary: "RSVP to public invite token", tags: ["Invites"] },
    },
  );
