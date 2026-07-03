import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { PaymentStatus } from "@prisma/client";

export class ChargeResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  bookingId!: string;

  @ApiProperty()
  amount!: number;

  @ApiProperty({ enum: PaymentStatus })
  status!: PaymentStatus;

  @ApiProperty()
  provider!: string;

  @ApiProperty()
  method!: string;

  @ApiPropertyOptional()
  providerReference?: string | null;

  @ApiPropertyOptional()
  providerRedirectUrl?: string | null;

  @ApiPropertyOptional()
  providerToken?: string | null;

  @ApiPropertyOptional()
  paidAt?: Date | null;
}
