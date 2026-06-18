import { ApiPropertyOptional } from "@nestjs/swagger";
import { VoucherType } from "@prisma/client";

export class UpdateVoucherDto {
  @ApiPropertyOptional() code?: string;
  @ApiPropertyOptional({ enum: VoucherType }) type?: VoucherType;
  @ApiPropertyOptional() value?: number;
  @ApiPropertyOptional({ nullable: true }) minPurchase?: number | null;
  @ApiPropertyOptional({ nullable: true }) maxDiscount?: number | null;
  @ApiPropertyOptional() usageLimit?: number;
  @ApiPropertyOptional() validFrom?: string;
  @ApiPropertyOptional() validUntil?: string;
  @ApiPropertyOptional() isActive?: boolean;
}
