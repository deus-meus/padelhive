import { VoucherType } from "@prisma/client";
import { VouchersService } from "./vouchers.service";
import { PrismaService } from "../prisma/prisma.service";

describe("VouchersService - repriceVoucherById", () => {
  let service: VouchersService;
  let prismaMock: any;

  beforeEach(() => {
    prismaMock = {
      voucher: {
        findUnique: jest.fn(),
      },
    };
    service = new VouchersService(prismaMock as unknown as PrismaService);
  });

  it("returns 0 if voucher is missing", async () => {
    prismaMock.voucher.findUnique.mockResolvedValue(null);
    const result = await service.repriceVoucherById("invalid-id", 100000);
    expect(result).toBe(0);
  });

  it("returns 0 if minPurchase is not met", async () => {
    prismaMock.voucher.findUnique.mockResolvedValue({
      id: "v1",
      minPurchase: 200000,
    });
    const result = await service.repriceVoucherById("v1", 100000);
    expect(result).toBe(0);
  });

  it("calculates PERCENTAGE discount correctly and applies maxDiscount", async () => {
    prismaMock.voucher.findUnique.mockResolvedValue({
      id: "v1",
      type: VoucherType.PERCENTAGE,
      value: 10,
      minPurchase: null,
      maxDiscount: 15000,
    });
    // 10% of 200000 is 20000, max is 15000
    const result = await service.repriceVoucherById("v1", 200000);
    expect(result).toBe(15000);

    // 10% of 100000 is 10000, max is 15000
    const result2 = await service.repriceVoucherById("v1", 100000);
    expect(result2).toBe(10000);
  });

  it("calculates NOMINAL discount and clamps to subtotal", async () => {
    prismaMock.voucher.findUnique.mockResolvedValue({
      id: "v1",
      type: VoucherType.NOMINAL,
      value: 50000,
      minPurchase: null,
      maxDiscount: null,
    });
    const result = await service.repriceVoucherById("v1", 100000);
    expect(result).toBe(50000);

    const result2 = await service.repriceVoucherById("v1", 30000);
    expect(result2).toBe(30000);
  });
});
