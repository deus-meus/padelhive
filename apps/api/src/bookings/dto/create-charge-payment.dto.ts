import { ApiProperty } from "@nestjs/swagger";

export class CreateChargePaymentDto {
  @ApiProperty({ description: "Payment method to use for the charge" })
  method!: string;
}
