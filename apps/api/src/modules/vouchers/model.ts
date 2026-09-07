import { VoucherType } from "@prisma/client";
import { type Static, t } from "elysia";

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

export const VoucherResponseSchema = t.Object(
  {
    id: t.Optional(t.String()),
    code: t.Optional(t.String()),
    type: t.Optional(VoucherTypeEnum),
    value: t.Optional(t.Number()),
    minPurchase: t.Optional(t.Nullable(t.Number())),
    maxDiscount: t.Optional(t.Nullable(t.Number())),
    usageLimit: t.Optional(t.Number()),
    usedCount: t.Optional(t.Number()),
    validFrom: t.Optional(t.Any()),
    validUntil: t.Optional(t.Any()),
    isActive: t.Optional(t.Boolean()),
    createdAt: t.Optional(t.Any()),
    updatedAt: t.Optional(t.Any()),
  },
  { additionalProperties: true },
);

export const ValidateVoucherResponseSchema = t.Object(
  {
    code: t.Optional(t.String()),
    type: t.Optional(VoucherTypeEnum),
    discount: t.Optional(t.Number()),
    finalAmount: t.Optional(t.Number()),
  },
  { additionalProperties: true },
);

export type ValidateVoucherInput = Static<typeof ValidateVoucherSchema>;
export type CreateVoucherInput = Static<typeof CreateVoucherSchema>;
export type UpdateVoucherInput = Static<typeof UpdateVoucherSchema>;
