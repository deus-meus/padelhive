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

export const RefundResponseSchema = t.Object(
  {
    id: t.Optional(t.String()),
    bookingId: t.Optional(t.String()),
    userId: t.Optional(t.String()),
    amount: t.Optional(t.Number()),
    reason: t.Optional(t.String()),
    status: t.Optional(RefundStatusEnum),
    adminNotes: t.Optional(t.Nullable(t.String())),
    processedAt: t.Optional(t.Nullable(t.Any())),
    booking: t.Optional(t.Any()),
    user: t.Optional(t.Any()),
    history: t.Optional(t.Array(t.Any())),
    createdAt: t.Optional(t.Any()),
    updatedAt: t.Optional(t.Any()),
  },
  { additionalProperties: true },
);

export type CreateRefundInput = Static<typeof CreateRefundSchema>;
export type AdminNotesInput = Static<typeof AdminNotesSchema>;
export type RejectRefundInput = Static<typeof RejectRefundSchema>;
export type RefundQueryInput = Static<typeof RefundQuerySchema>;
