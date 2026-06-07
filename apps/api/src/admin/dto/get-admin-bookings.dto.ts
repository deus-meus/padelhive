import { ApiPropertyOptional } from "@nestjs/swagger";
import { BookingStatus } from "@prisma/client";

export class GetAdminBookingsDto {
  @ApiPropertyOptional({ enum: BookingStatus })
  status?: BookingStatus;

  @ApiPropertyOptional()
  venueId?: string;

  @ApiPropertyOptional({ description: "Format: YYYY-MM-DD" })
  fromDate?: string;

  @ApiPropertyOptional({ description: "Format: YYYY-MM-DD" })
  toDate?: string;

  @ApiPropertyOptional({ default: 1 })
  page?: number | string;

  @ApiPropertyOptional({ default: 20, maximum: 100 })
  pageSize?: number | string;
}
