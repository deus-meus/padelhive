import { VoucherType } from "@prisma/client";
import type { PrismaService } from "../../common/prisma";
import { VouchersService } from "./service";

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

  it("calculates percentage discount correctly", async () => {
    prismaMock.voucher.findUnique.mockResolvedValue({
      id: "v1",
      type: VoucherType.PERCENTAGE,
      value: 10,
      minPurchase: 50000,
      maxDiscount: 50000,
    });
    const result = await service.repriceVoucherById("v1", 100000);
    expect(result).toBe(10000);
  });

  it("caps percentage discount at maxDiscount", async () => {
    prismaMock.voucher.findUnique.mockResolvedValue({
      id: "v1",
      type: VoucherType.PERCENTAGE,
      value: 50,
      minPurchase: 50000,
      maxDiscount: 20000,
    });
    const result = await service.repriceVoucherById("v1", 100000);
    expect(result).toBe(20000);
  });

  it("calculates nominal discount correctly", async () => {
    prismaMock.voucher.findUnique.mockResolvedValue({
      id: "v1",
      type: VoucherType.NOMINAL,
      value: 15000,
      minPurchase: 50000,
    });
    const result = await service.repriceVoucherById("v1", 100000);
    expect(result).toBe(15000);
  });
});
