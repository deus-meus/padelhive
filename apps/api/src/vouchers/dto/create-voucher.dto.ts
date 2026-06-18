import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { VoucherType } from "@prisma/client";

export class CreateVoucherDto {
  @ApiProperty({ example: "WELCOME20" })
  code!: string;

  @ApiProperty({ enum: VoucherType })
  type!: VoucherType;

  @ApiProperty({ example: 20, description: "Percentage (1-100) when PERCENTAGE, or nominal IDR when NOMINAL" })
  value!: number;

  @ApiPropertyOptional({ nullable: true, example: 100000 })
  minPurchase?: number | null;

  @ApiPropertyOptional({ nullable: true, example: 50000, description: "Only applies to PERCENTAGE vouchers" })
  maxDiscount?: number | null;

  @ApiProperty({ example: 100 })
  usageLimit!: number;

  @ApiProperty({ example: "2026-06-01T00:00:00.000Z" })
  validFrom!: string;

  @ApiProperty({ example: "2026-12-31T23:59:59.000Z" })
  validUntil!: string;

  @ApiPropertyOptional({ default: true })
  isActive?: boolean;
}
