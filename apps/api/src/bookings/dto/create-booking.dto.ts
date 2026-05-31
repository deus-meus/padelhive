import { ApiProperty } from "@nestjs/swagger";

export class CreateBookingDto {
  @ApiProperty({ example: "venue-1" })
  venueId!: string;

  @ApiProperty({ example: "court-1" })
  courtId!: string;

  @ApiProperty({ example: "2099-06-01", description: "Booking date in YYYY-MM-DD format" })
  bookingDate!: string;

  @ApiProperty({ example: "09:00", description: "Start time in HH:mm format" })
  startsAt!: string;

  @ApiProperty({ example: "11:00", description: "End time in HH:mm format" })
  endsAt!: string;
}
