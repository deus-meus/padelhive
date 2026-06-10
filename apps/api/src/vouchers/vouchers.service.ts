import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { VoucherType } from "@prisma/client";
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

  async priceVoucher(
    code: string,
    amount: number,
    now = new Date()
  ): Promise<{ voucherId: string; code: string; type: VoucherType; discount: number }> {
    const voucher = await this.prisma.voucher.findUnique({ where: { code } });
    if (!voucher || !voucher.isActive) {
      throw new NotFoundException("Voucher not found");
    }
    if (voucher.validFrom > now || voucher.validUntil < now) {
      throw new BadRequestException("Voucher is not valid at this time");
    }
    if (voucher.usedCount >= voucher.usageLimit) {
      throw new BadRequestException("Voucher usage limit reached");
    }
    if (voucher.minPurchase != null && amount < voucher.minPurchase) {
      throw new BadRequestException("Minimum purchase not met for this voucher");
    }

    let discount = 0;
    if (voucher.type === VoucherType.PERCENTAGE) {
      discount = Math.floor((amount * voucher.value) / 100);
      if (voucher.maxDiscount != null) {
        discount = Math.min(discount, voucher.maxDiscount);
      }
    } else {
      discount = voucher.value;
    }
    discount = Math.max(0, Math.min(discount, amount));

    return { voucherId: voucher.id, code: voucher.code, type: voucher.type, discount };
  }
}
