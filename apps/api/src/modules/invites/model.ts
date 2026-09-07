import { InviteStatus } from "@prisma/client";
import { type Static, t } from "elysia";

export const InviteStatusEnum = t.Enum(InviteStatus);

export const CreateInviteSchema = t.Object({
  email: t.String(),
});

export const RsvpInviteSchema = t.Object({
  status: t.Union([t.Literal("ACCEPTED"), t.Literal("DECLINED")]),
});

export const InviteResponseSchema = t.Object(
  {
    id: t.Optional(t.String()),
    bookingId: t.Optional(t.String()),
    email: t.Optional(t.String()),
    token: t.Optional(t.String()),
    status: t.Optional(InviteStatusEnum),
    invitedByUserId: t.Optional(t.String()),
    booking: t.Optional(t.Any()),
    createdAt: t.Optional(t.Any()),
    updatedAt: t.Optional(t.Any()),
  },
  { additionalProperties: true },
);

export type CreateInviteInput = Static<typeof CreateInviteSchema>;
export type RsvpInviteInput = Static<typeof RsvpInviteSchema>;
