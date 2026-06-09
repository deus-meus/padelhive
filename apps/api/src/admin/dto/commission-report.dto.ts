import { ApiProperty } from "@nestjs/swagger";

export class CommissionVenueRowDto {
  @ApiProperty()
  venueId!: string;

  @ApiProperty()
  venueName!: string;

  @ApiProperty()
  city!: string;

  @ApiProperty()
  commissionRate!: number;

  @ApiProperty()
  bookings!: number;

  @ApiProperty()
  gmv!: number;

  @ApiProperty()
  commission!: number;

  @ApiProperty()
  effectiveRate!: number;
}

export class CommissionReportDto {
  @ApiProperty()
  totalCommission!: number;

  @ApiProperty()
  totalGmv!: number;

  @ApiProperty()
  totalBookings!: number;

  @ApiProperty()
  avgCommissionRate!: number;

  @ApiProperty({ type: () => [CommissionVenueRowDto] })
  venues!: CommissionVenueRowDto[];
}
