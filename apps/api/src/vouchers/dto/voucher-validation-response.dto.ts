import { ApiProperty } from "@nestjs/swagger";
import { VoucherType } from "@prisma/client";

export class VoucherValidationResponseDto {
  @ApiProperty()
  code!: string;

  @ApiProperty({ enum: VoucherType })
  type!: VoucherType;

  @ApiProperty({ description: "Discount in IDR" })
  discount!: number;

  @ApiProperty({ description: "Subtotal minus discount, in IDR" })
  finalAmount!: number;
}
