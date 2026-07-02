import { ApiProperty } from "@nestjs/swagger";

export class CreateSharePaymentDto {
  @ApiProperty({ enum: ["va", "ewallet", "card"] })
  method!: "va" | "ewallet" | "card";
}
