import { ApiProperty } from "@nestjs/swagger";
import { InviteStatus } from "@prisma/client";

class InviteVenueResponseDto {
  @ApiProperty({ example: "venue-1" })
  id!: string;

  @ApiProperty({ example: "Padel Bali" })
  name!: string;

  @ApiProperty({ example: "Bali" })
  city!: string;
}

class InviteCourtResponseDto {
  @ApiProperty({ example: "court-1" })
  id!: string;

  @ApiProperty({ example: "Court A" })
  name!: string;

  @ApiProperty({ example: "OUTDOOR" })
  type!: string;
}

class InviteHostResponseDto {
  @ApiProperty({ example: "user-1" })
  id!: string;

  @ApiProperty({ example: "Player One", nullable: true })
  name!: string | null;

  @ApiProperty({ example: "player@padelhive.com" })
  email!: string;
}

class InviteBookingResponseDto {
  @ApiProperty({ example: "booking-1" })
  id!: string;

  @ApiProperty({ example: "2026-06-10T00:00:00.000Z" })
  bookingDate!: Date;

  @ApiProperty({ example: "2026-06-10T09:00:00.000Z" })
  startsAt!: Date;

  @ApiProperty({ example: "2026-06-10T11:00:00.000Z" })
  endsAt!: Date;

  @ApiProperty({ example: "CONFIRMED" })
  status!: string;

  @ApiProperty({ type: InviteVenueResponseDto })
  venue!: InviteVenueResponseDto;

  @ApiProperty({ type: InviteCourtResponseDto })
  court!: InviteCourtResponseDto;

  @ApiProperty({ type: InviteHostResponseDto })
  host!: InviteHostResponseDto;
}

export class InviteResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  bookingId!: string;

  @ApiProperty({ required: false, nullable: true })
  userId!: string | null;

  @ApiProperty()
  email!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  token!: string;

  @ApiProperty({ enum: InviteStatus })
  status!: InviteStatus;

  @ApiProperty()
  isHost!: boolean;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;

  @ApiProperty({ type: InviteBookingResponseDto, required: false })
  booking?: InviteBookingResponseDto;
}
