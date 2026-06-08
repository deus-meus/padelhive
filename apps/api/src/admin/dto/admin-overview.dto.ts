import { ApiProperty } from "@nestjs/swagger";

export class AdminOverviewDto {
  @ApiProperty({ description: "GMV this month in integer rupiah" })
  gmv!: number;

  @ApiProperty({ description: "Commission revenue this month in integer rupiah" })
  commissionRevenue!: number;

  @ApiProperty({ description: "Total bookings all-time excluding cancelled/expired" })
  totalBookings!: number;

  @ApiProperty({ description: "Number of active venues (APPROVED)" })
  activeVenues!: number;

  @ApiProperty({ description: "Number of venues pending approval (PENDING)" })
  pendingApprovals!: number;

  @ApiProperty({ description: "Number of refund requests (PENDING)" })
  refundRequests!: number;

  @ApiProperty({ description: "Payment success rate 0-100" })
  paymentSuccessRate!: number;

  @ApiProperty({ description: "Average booking value this month in integer rupiah" })
  avgBookingValue!: number;

  @ApiProperty({ description: "Average commission rate this month (one decimal, e.g., 10.5)" })
  avgCommissionRate!: number;
}
