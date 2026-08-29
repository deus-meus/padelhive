import { InviteStatus } from "@prisma/client";
import { type Static, t } from "elysia";

export const InviteStatusEnum = t.Enum(InviteStatus);

export const CreateInviteSchema = t.Object({
  email: t.String(),
});

export const RsvpInviteSchema = t.Object({
  status: t.Union([t.Literal("ACCEPTED"), t.Literal("DECLINED")]),
});

export type CreateInviteInput = Static<typeof CreateInviteSchema>;
export type RsvpInviteInput = Static<typeof RsvpInviteSchema>;
