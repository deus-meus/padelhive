import { ApiProperty } from "@nestjs/swagger";

export class AdminMetricsMonthDto {
  @ApiProperty()
  month!: string;

  @ApiProperty()
  gmv!: number;

  @ApiProperty()
  commission!: number;

  @ApiProperty()
  bookings!: number;
}

export class AdminMetricsStatusDto {
  @ApiProperty()
  status!: string;

  @ApiProperty()
  count!: number;
}

export class AdminMetricsDto {
  @ApiProperty()
  totalGmv!: number;

  @ApiProperty()
  totalCommission!: number;

  @ApiProperty()
  totalBookings!: number;

  @ApiProperty()
  avgMonthlyGmv!: number;

  @ApiProperty({ type: () => [AdminMetricsMonthDto] })
  monthlySeries!: AdminMetricsMonthDto[];

  @ApiProperty({ type: () => [AdminMetricsStatusDto] })
  statusBreakdown!: AdminMetricsStatusDto[];
}
