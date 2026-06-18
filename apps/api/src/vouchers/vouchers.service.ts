import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma, VoucherType, Voucher } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { VoucherResponseDto } from "./dto/voucher-response.dto";
import { CreateVoucherDto } from "./dto/create-voucher.dto";
import { UpdateVoucherDto } from "./dto/update-voucher.dto";

@Injectable()
export class VouchersService {
  constructor(private readonly prisma: PrismaService) {}

  private toResponse(voucher: Voucher): VoucherResponseDto {
    return {
      id: voucher.id,
      code: voucher.code,
      type: voucher.type,
      value: voucher.value,
      minPurchase: voucher.minPurchase,
      maxDiscount: voucher.maxDiscount,
      usageLimit: voucher.usageLimit,
      usedCount: voucher.usedCount,
      validFrom: voucher.validFrom,
      validUntil: voucher.validUntil,
      isActive: voucher.isActive,
    };
  }

  private validateVoucherFields(dto: {
    code: string;
    type: VoucherType;
    value: number;
    usageLimit: number;
    minPurchase: number | null;
    maxDiscount: number | null;
    validFrom: Date;
    validUntil: Date;
  }) {
    if (!dto.code || dto.code.length === 0 || dto.code.length > 40) {
      throw new BadRequestException("Code must be between 1 and 40 characters");
    }
    if (dto.type !== VoucherType.NOMINAL && dto.type !== VoucherType.PERCENTAGE) {
      throw new BadRequestException("Type must be NOMINAL or PERCENTAGE");
    }
    if (!Number.isInteger(dto.value) || dto.value <= 0) {
      throw new BadRequestException("Value must be a positive integer");
    }
    if (dto.type === VoucherType.PERCENTAGE && dto.value > 100) {
      throw new BadRequestException("Percentage value must be between 1 and 100");
    }
    if (!Number.isInteger(dto.usageLimit) || dto.usageLimit < 1) {
      throw new BadRequestException("Usage limit must be a positive integer");
    }
    if (dto.minPurchase != null && (!Number.isInteger(dto.minPurchase) || dto.minPurchase < 0)) {
      throw new BadRequestException("Min purchase must be a non-negative integer");
    }
    if (dto.maxDiscount != null && (!Number.isInteger(dto.maxDiscount) || dto.maxDiscount < 0)) {
      throw new BadRequestException("Max discount must be a non-negative integer");
    }
    if (Number.isNaN(dto.validFrom.getTime())) {
      throw new BadRequestException("Invalid validFrom date");
    }
    if (Number.isNaN(dto.validUntil.getTime())) {
      throw new BadRequestException("Invalid validUntil date");
    }
    if (dto.validUntil <= dto.validFrom) {
      throw new BadRequestException("validUntil must be strictly after validFrom");
    }
  }

  async findAllForAdmin(): Promise<VoucherResponseDto[]> {
    const vouchers = await this.prisma.voucher.findMany({ orderBy: { createdAt: "desc" } });
    return vouchers.map((v) => this.toResponse(v));
  }

  async createVoucher(dto: CreateVoucherDto): Promise<VoucherResponseDto> {
    const code = (dto.code ?? "").trim().toUpperCase();
    const validFrom = new Date(dto.validFrom);
    const validUntil = new Date(dto.validUntil);

    this.validateVoucherFields({
      code,
      type: dto.type,
      value: dto.value,
      usageLimit: dto.usageLimit,
      minPurchase: dto.minPurchase ?? null,
      maxDiscount: dto.maxDiscount ?? null,
      validFrom,
      validUntil,
    });

    try {
      const created = await this.prisma.voucher.create({
        data: {
          code,
          type: dto.type,
          value: dto.value,
          minPurchase: dto.minPurchase ?? null,
          maxDiscount: dto.maxDiscount ?? null,
          usageLimit: dto.usageLimit,
          usedCount: 0,
          validFrom,
          validUntil,
          isActive: dto.isActive ?? true,
        },
      });
      return this.toResponse(created);
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
        throw new ConflictException("A voucher with this code already exists");
      }
      throw e;
    }
  }

  async updateVoucher(id: string, dto: UpdateVoucherDto): Promise<VoucherResponseDto> {
    const existing = await this.prisma.voucher.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException("Voucher not found");

    const code = dto.code !== undefined ? dto.code.trim().toUpperCase() : existing.code;
    const type = dto.type !== undefined ? dto.type : existing.type;
    const value = dto.value !== undefined ? dto.value : existing.value;
    const usageLimit = dto.usageLimit !== undefined ? dto.usageLimit : existing.usageLimit;
    const minPurchase = dto.minPurchase !== undefined ? dto.minPurchase : existing.minPurchase;
    const maxDiscount = dto.maxDiscount !== undefined ? dto.maxDiscount : existing.maxDiscount;
    const validFrom = dto.validFrom !== undefined ? new Date(dto.validFrom) : existing.validFrom;
    const validUntil = dto.validUntil !== undefined ? new Date(dto.validUntil) : existing.validUntil;

    this.validateVoucherFields({
      code,
      type,
      value,
      usageLimit,
      minPurchase,
      maxDiscount,
      validFrom,
      validUntil,
    });

    const updateData: Prisma.VoucherUpdateInput = {};
    if (dto.code !== undefined) updateData.code = code;
    if (dto.type !== undefined) updateData.type = type;
    if (dto.value !== undefined) updateData.value = value;
    if (dto.minPurchase !== undefined) updateData.minPurchase = minPurchase;
    if (dto.maxDiscount !== undefined) updateData.maxDiscount = maxDiscount;
    if (dto.usageLimit !== undefined) updateData.usageLimit = usageLimit;
    if (dto.validFrom !== undefined) updateData.validFrom = validFrom;
    if (dto.validUntil !== undefined) updateData.validUntil = validUntil;
    if (dto.isActive !== undefined) updateData.isActive = dto.isActive;

    try {
      const updated = await this.prisma.voucher.update({ where: { id }, data: updateData });
      return this.toResponse(updated);
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
        throw new ConflictException("A voucher with this code already exists");
      }
      throw e;
    }
  }

  async deleteVoucher(id: string): Promise<{ id: string }> {
    const existing = await this.prisma.voucher.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException("Voucher not found");
    try {
      await this.prisma.voucher.delete({ where: { id } });
      return { id };
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2003") {
        throw new BadRequestException("This voucher is referenced by bookings and cannot be deleted. Deactivate it instead.");
      }
      throw e;
    }
  }

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
