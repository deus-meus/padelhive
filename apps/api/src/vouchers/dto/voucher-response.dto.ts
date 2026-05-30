import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { VoucherType } from "@prisma/client";

export class VoucherResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  code!: string;

  @ApiProperty({ enum: VoucherType })
  type!: VoucherType;

  @ApiProperty()
  value!: number;

  @ApiPropertyOptional({ nullable: true })
  minPurchase!: number | null;

  @ApiPropertyOptional({ nullable: true })
  maxDiscount!: number | null;

  @ApiProperty()
  usageLimit!: number;

  @ApiProperty()
  usedCount!: number;

  @ApiProperty()
  validFrom!: Date;

  @ApiProperty()
  validUntil!: Date;

  @ApiProperty()
  isActive!: boolean;
}
