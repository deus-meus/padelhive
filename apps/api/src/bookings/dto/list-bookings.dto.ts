import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { BookingStatus } from "@prisma/client";

export class ListBookingsQueryDto {
  @ApiPropertyOptional({
    enum: ["upcoming", "past", "cancelled"],
    default: "upcoming",
  })
  filter?: "upcoming" | "past" | "cancelled";
}

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

  @ApiProperty({ enum: ["INDOOR", "OUTDOOR"] })
  type!: "INDOOR" | "OUTDOOR";
}

export class BookingListItemDto {
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
  finalAmount!: number;

  @ApiProperty({ type: () => BookingVenueSummaryDto })
  venue!: BookingVenueSummaryDto;

  @ApiProperty({ type: () => BookingCourtSummaryDto })
  court!: BookingCourtSummaryDto;
}