import { ApiProperty } from "@nestjs/swagger";

class OwnerDashboardKpisDto {
  @ApiProperty({ description: "Total revenue in the last 7 days (integer rupiah)" })
  weeklyRevenue!: number;

  @ApiProperty({ description: "Total bookings in the last 7 days" })
  weeklyBookings!: number;

  @ApiProperty({ description: "Average occupancy rate of active courts over the last 7 days (0-100)" })
  occupancyRate!: number;

  @ApiProperty({ description: "Number of active courts" })
  activeCourts!: number;

  @ApiProperty({ description: "Number of bookings pending payment" })
  pendingPayments!: number;
}

class OwnerDashboardRevenueSeriesDto {
  @ApiProperty({ description: "Date string (YYYY-MM-DD)" })
  date!: string;

  @ApiProperty({ description: "Short weekday label (e.g., 'Mon')" })
  label!: string;

  @ApiProperty({ description: "Revenue amount for this day (integer rupiah)" })
  value!: number;
}

class OwnerDashboardCourtUtilizationDto {
  @ApiProperty({ description: "Court ID" })
  courtId!: string;

  @ApiProperty({ description: "Court name" })
  name!: string;

  @ApiProperty({ description: "Occupancy rate (0-100)" })
  occupancyRate!: number;
}

class OwnerDashboardTodaysScheduleDto {
  @ApiProperty({ description: "Booking ID" })
  bookingId!: string;

  @ApiProperty({ description: "Booking time (WIB HH:mm)" })
  time!: string;

  @ApiProperty({ description: "Court name" })
  court!: string;

  @ApiProperty({ description: "Player name or 'Guest'" })
  player!: string;

  @ApiProperty({ description: "Booking status" })
  status!: string;
}

class OwnerDashboardRecentBookingDto {
  @ApiProperty({ description: "Booking ID" })
  id!: string;

  @ApiProperty({ description: "Venue name" })
  venueName!: string;

  @ApiProperty({ description: "Court name" })
  courtName!: string;

  @ApiProperty({ description: "Booking date (WIB YYYY-MM-DD)" })
  bookingDate!: string;

  @ApiProperty({ description: "Booking time (WIB HH:mm)" })
  time!: string;

  @ApiProperty({ description: "Final amount (integer rupiah)" })
  finalAmount!: number;

  @ApiProperty({ description: "Booking status" })
  status!: string;
}

export class OwnerDashboardDto {
  @ApiProperty({ type: OwnerDashboardKpisDto })
  kpis!: OwnerDashboardKpisDto;

  @ApiProperty({ type: [OwnerDashboardRevenueSeriesDto] })
  revenueSeries!: OwnerDashboardRevenueSeriesDto[];

  @ApiProperty({ type: [OwnerDashboardCourtUtilizationDto] })
  courtUtilization!: OwnerDashboardCourtUtilizationDto[];

  @ApiProperty({ type: [OwnerDashboardTodaysScheduleDto] })
  todaysSchedule!: OwnerDashboardTodaysScheduleDto[];

  @ApiProperty({ type: [OwnerDashboardRecentBookingDto] })
  recentBookings!: OwnerDashboardRecentBookingDto[];
}
