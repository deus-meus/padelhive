import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { VoucherResponseDto } from "./dto/voucher-response.dto";

@Injectable()
export class VouchersService {
  constructor(private readonly prisma: PrismaService) {}

  async findActiveVouchers(now = new Date()): Promise<VoucherResponseDto[]> {
    const vouchers = await this.prisma.voucher.findMany({
      where: {
        isActive: true,
        validFrom: { lte: now },
        validUntil: { gte: now },
      },
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

    return vouchers.filter((voucher) => voucher.usedCount < voucher.usageLimit);
  }
}
