import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { FirebaseAuthGuard } from "../auth/guards/firebase-auth.guard";
import { RequestUser } from "../auth/types/request-user.type";
import { BookingsService } from "./bookings.service";
import { BookingResponseDto } from "./dto/booking-response.dto";
import { CreateBookingDto } from "./dto/create-booking.dto";

@ApiTags("bookings")
@Controller("bookings")
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Create a pending-payment booking" })
  @ApiCreatedResponse({ type: BookingResponseDto })
  @ApiUnauthorizedResponse({ description: "Authentication required" })
  @ApiBadRequestResponse({ description: "Invalid booking request" })
  @ApiNotFoundResponse({ description: "Venue or court not found" })
  @ApiConflictResponse({ description: "Court is unavailable for the requested time" })
  create(@Body() body: CreateBookingDto, @CurrentUser() user: RequestUser): Promise<BookingResponseDto> {
    return this.bookingsService.createBookingForUser(user.id, body);
  }

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
