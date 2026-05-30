import { Controller, Get, Param, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags, ApiUnauthorizedResponse } from "@nestjs/swagger";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { FirebaseAuthGuard } from "../auth/guards/firebase-auth.guard";
import { RequestUser } from "../auth/types/request-user.type";
import { BookingsService } from "./bookings.service";
import { BookingResponseDto } from "./dto/booking-response.dto";

@ApiTags("bookings")
@Controller("bookings")
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Get(":id")
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get current user's booking details" })
  @ApiOkResponse({ type: BookingResponseDto })
  @ApiUnauthorizedResponse({ description: "Authentication required" })
  @ApiNotFoundResponse({ description: "Booking not found" })
  findOne(@Param("id") id: string, @CurrentUser() user: RequestUser): Promise<BookingResponseDto> {
    return this.bookingsService.findBookingForUser(id, user.id);
  }
}
