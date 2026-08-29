import { t, Static } from "elysia";
import { InviteStatus } from "@prisma/client";

export const InviteStatusEnum = t.Enum(InviteStatus);

export const CreateInviteSchema = t.Object({
  email: t.String(),
});

export const RsvpInviteSchema = t.Object({
  status: t.Union([t.Literal("ACCEPTED"), t.Literal("DECLINED")]),
});

export type CreateInviteInput = Static<typeof CreateInviteSchema>;
export type RsvpInviteInput = Static<typeof RsvpInviteSchema>;
