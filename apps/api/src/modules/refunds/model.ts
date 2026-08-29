import { RefundStatus } from "@prisma/client";
import { type Static, t } from "elysia";

export const RefundStatusEnum = t.Enum(RefundStatus);

export const CreateRefundSchema = t.Object({
  bookingId: t.String(),
  reason: t.String(),
});

export const AdminNotesSchema = t.Object({
  adminNotes: t.Optional(t.String()),
});

export const RejectRefundSchema = t.Object({
  adminNotes: t.String(),
});

export const RefundQuerySchema = t.Object({
  status: t.Optional(t.String()),
});

export type CreateRefundInput = Static<typeof CreateRefundSchema>;
export type AdminNotesInput = Static<typeof AdminNotesSchema>;
export type RejectRefundInput = Static<typeof RejectRefundSchema>;
export type RefundQueryInput = Static<typeof RefundQuerySchema>;
