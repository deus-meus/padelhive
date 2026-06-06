import { ApiProperty } from "@nestjs/swagger";

export class CreatePaymentIntentDto {
  @ApiProperty({ example: "booking-1" })
  bookingId!: string;

  @ApiProperty({ enum: ["internal", "midtrans"], example: "midtrans" })
  provider!: "internal" | "midtrans";

  @ApiProperty({ enum: ["va", "ewallet", "card"], example: "va" })
  method!: "va" | "ewallet" | "card";
}
