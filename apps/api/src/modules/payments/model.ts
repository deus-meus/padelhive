import { PaymentStatus } from "@prisma/client";
import { type Static, t } from "elysia";

export const PaymentStatusEnum = t.Enum(PaymentStatus);

export const CreatePaymentIntentSchema = t.Object({
  bookingId: t.String(),
  provider: t.Union([t.Literal("internal"), t.Literal("midtrans")]),
  method: t.Union([t.Literal("va"), t.Literal("ewallet"), t.Literal("card")]),
});

export const MidtransWebhookSchema = t.Object({
  order_id: t.String(),
  status_code: t.String(),
  gross_amount: t.String(),
  signature_key: t.String(),
  transaction_status: t.String(),
  fraud_status: t.Optional(t.String()),
});

export type CreatePaymentIntentInput = Static<typeof CreatePaymentIntentSchema>;
export type MidtransWebhookInput = Static<typeof MidtransWebhookSchema>;
