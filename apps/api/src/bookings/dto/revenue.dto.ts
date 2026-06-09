import { ApiProperty } from '@nestjs/swagger';

class MonthlySeriesItem {
  @ApiProperty()
  month!: string;

  @ApiProperty()
  value!: number;
}

class WeeklySeriesItem {
  @ApiProperty()
  day!: string;

  @ApiProperty()
  value!: number;
}

class RevenueKpis {
  @ApiProperty()
  totalRevenue!: number;

  @ApiProperty()
  totalBookings!: number;

  @ApiProperty()
  avgBookingValue!: number;

  @ApiProperty()
  uniquePlayers!: number;

  @ApiProperty()
  cancellationRate!: number;

  @ApiProperty()
  repeatCustomerRate!: number;
}

class TopCourtItem {
  @ApiProperty()
  courtId!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  venue!: string;

  @ApiProperty()
  bookings!: number;

  @ApiProperty()
  revenue!: number;
}

export class RevenueDto {
  @ApiProperty({ type: [MonthlySeriesItem] })
  monthlySeries!: MonthlySeriesItem[];

  @ApiProperty({ type: [WeeklySeriesItem] })
  weeklySeries!: WeeklySeriesItem[];

  @ApiProperty({ type: RevenueKpis })
  kpis!: RevenueKpis;

  @ApiProperty({ type: [TopCourtItem] })
  topCourts!: TopCourtItem[];
}
