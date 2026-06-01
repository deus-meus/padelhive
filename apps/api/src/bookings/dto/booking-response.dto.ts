import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { BookingStatus, CourtType } from "@prisma/client";

export class BookingVenueSummaryDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  city!: string;
}

export class BookingCourtSummaryDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty({ enum: CourtType })
  type!: CourtType;
}

export class BookingHostSummaryDto {
  @ApiProperty()
  id!: string;

  @ApiProperty({ nullable: true })
  name!: string | null;

  @ApiProperty()
  email!: string;
}

export class BookingResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  bookingDate!: Date;

  @ApiProperty()
  startsAt!: Date;

  @ApiProperty()
  endsAt!: Date;

  @ApiProperty()
  durationMinutes!: number;

  @ApiProperty({ enum: BookingStatus })
  status!: BookingStatus;

  @ApiProperty()
  courtAmount!: number;

  @ApiProperty()
  platformFee!: number;

  @ApiProperty()
  voucherDiscount!: number;

  @ApiProperty()
  finalAmount!: number;

  @ApiPropertyOptional({ example: true })
  isRefundEligible?: boolean;

  @ApiPropertyOptional({ example: 630000 })
  refundAmount?: number;

  @ApiPropertyOptional({ example: "Full refund eligible: cancelled at least 24 hours before booking start." })
  refundPolicyReason?: string;

  @ApiProperty({ type: BookingVenueSummaryDto })
  venue!: BookingVenueSummaryDto;

  @ApiProperty({ type: BookingCourtSummaryDto })
  court!: BookingCourtSummaryDto;

  @ApiProperty({ type: BookingHostSummaryDto })
  host!: BookingHostSummaryDto;
}
