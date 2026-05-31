import { ApiProperty } from "@nestjs/swagger";

export class CreatePaymentIntentDto {
  @ApiProperty({ example: "booking-1" })
  bookingId!: string;

  @ApiProperty({ enum: ["va", "ewallet", "card"], example: "va" })
  method!: "va" | "ewallet" | "card";
}
