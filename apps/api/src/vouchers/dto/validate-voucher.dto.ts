import { ApiProperty } from "@nestjs/swagger";

export class ValidateVoucherDto {
  @ApiProperty({ example: "WELCOME10" })
  code!: string;

  @ApiProperty({ example: 250000, description: "Pre-discount subtotal in IDR (courtAmount + platformFee)" })
  amount!: number;
}
