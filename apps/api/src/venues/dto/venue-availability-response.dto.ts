import { ApiProperty } from "@nestjs/swagger";

export class VenueAvailabilitySlotDto {
  @ApiProperty({ example: "06:00" })
  startsAt!: string;

  @ApiProperty({ example: "07:00" })
  endsAt!: string;

  @ApiProperty({ example: true })
  available!: boolean;

  @ApiProperty({ example: 120000 })
  price!: number;

  @ApiProperty({ example: false })
  isPeak!: boolean;
}

export class VenueAvailabilityCourtDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty({ enum: ["INDOOR", "OUTDOOR"] })
  type!: "INDOOR" | "OUTDOOR";

  @ApiProperty({ type: [VenueAvailabilitySlotDto] })
  slots!: VenueAvailabilitySlotDto[];
}

export class VenueAvailabilityResponseDto {
  @ApiProperty({ example: "2026-06-15" })
  date!: string;

  @ApiProperty({ example: "Asia/Jakarta" })
  timezone!: string;

  @ApiProperty({ type: [VenueAvailabilityCourtDto] })
  courts!: VenueAvailabilityCourtDto[];
}