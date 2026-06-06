import { VoucherType } from "@prisma/client";
import { VouchersController } from "./vouchers.controller";
import { VouchersService } from "./vouchers.service";

describe("Read-only vouchers API", () => {
  it("queries active currently valid vouchers only", async () => {
    const prisma = { voucher: { findMany: jest.fn().mockResolvedValue([]) } };
    const service = new VouchersService(prisma as never);
    const now = new Date("2026-05-31T12:00:00.000Z");

    await service.findActiveVouchers(now);

    expect(prisma.voucher.findMany).toHaveBeenCalledWith({
      where: { isActive: true, validFrom: { lte: now }, validUntil: { gte: now } },
      orderBy: { validUntil: "asc" },
      select: {
        id: true,
        code: true,
        type: true,
        value: true,
        minPurchase: true,
        maxDiscount: true,
        usageLimit: true,
        usedCount: true,
        validFrom: true,
        validUntil: true,
        isActive: true,
      },
    });
  });

  it("omits exhausted vouchers after querying active valid vouchers", async () => {
    const validVoucher = { id: "voucher-1", code: "WELCOME10", type: VoucherType.PERCENTAGE, value: 10, minPurchase: null, maxDiscount: 50000, usageLimit: 100, usedCount: 99, validFrom: new Date("2026-05-01T00:00:00.000Z"), validUntil: new Date("2026-06-01T00:00:00.000Z"), isActive: true };
    const exhaustedVoucher = { ...validVoucher, id: "voucher-2", code: "USEDUP", usedCount: 100 };
    const prisma = { voucher: { findMany: jest.fn().mockResolvedValue([validVoucher, exhaustedVoucher]) } };
    const service = new VouchersService(prisma as never);

    await expect(service.findActiveVouchers(new Date("2026-05-31T12:00:00.000Z"))).resolves.toEqual([validVoucher]);
  });

  it("exposes vouchers controller route", async () => {
    const vouchers = [{ id: "voucher-1", code: "WELCOME10", type: VoucherType.PERCENTAGE, value: 10, minPurchase: null, maxDiscount: 50000, usageLimit: 100, usedCount: 0, validFrom: new Date("2026-05-01T00:00:00.000Z"), validUntil: new Date("2026-06-01T00:00:00.000Z"), isActive: true }];
    const service = { findActiveVouchers: jest.fn().mockResolvedValue(vouchers) } as unknown as VouchersService;
    const controller = new VouchersController(service);

    await expect(controller.findAll()).resolves.toEqual(vouchers);
  });
});
