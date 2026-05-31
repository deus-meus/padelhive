import { ApiProperty } from "@nestjs/swagger";
import { BookingStatus, CourtType, PaymentStatus } from "@prisma/client";

export class PaymentBookingVenueDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  city!: string;
}

export class PaymentBookingCourtDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty({ enum: CourtType })
  type!: CourtType;
}

export class PaymentBookingSummaryDto {
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

  @ApiProperty({ type: PaymentBookingVenueDto })
  venue!: PaymentBookingVenueDto;

  @ApiProperty({ type: PaymentBookingCourtDto })
  court!: PaymentBookingCourtDto;
}

export class PaymentResponseDto {
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

  @ApiProperty({ required: false, nullable: true })
  providerReference!: string | null;

  @ApiProperty({ required: false, nullable: true })
  paidAt!: Date | null;

  @ApiProperty({ required: false, nullable: true })
  failedAt!: Date | null;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;

  @ApiProperty({ type: PaymentBookingSummaryDto })
  booking!: PaymentBookingSummaryDto;
}
