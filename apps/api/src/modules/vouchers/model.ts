import { t, Static } from "elysia";
import { VoucherType } from "@prisma/client";

export const VoucherTypeEnum = t.Enum(VoucherType);

export const ValidateVoucherSchema = t.Object({
  code: t.String(),
  amount: t.Number(),
});

export const CreateVoucherSchema = t.Object({
  code: t.String(),
  type: VoucherTypeEnum,
  value: t.Number(),
  minPurchase: t.Optional(t.Nullable(t.Number())),
  maxDiscount: t.Optional(t.Nullable(t.Number())),
  usageLimit: t.Number(),
  validFrom: t.String(),
  validUntil: t.String(),
  isActive: t.Optional(t.Boolean()),
});

export const UpdateVoucherSchema = t.Partial(CreateVoucherSchema);

export type ValidateVoucherInput = Static<typeof ValidateVoucherSchema>;
export type CreateVoucherInput = Static<typeof CreateVoucherSchema>;
export type UpdateVoucherInput = Static<typeof UpdateVoucherSchema>;
