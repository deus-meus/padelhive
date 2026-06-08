import { Body, Controller, Get, Param, Patch, Post, Query } from "@nestjs/common";
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger";
import { UserRole } from "@prisma/client";
import { Roles } from "../auth/decorators/roles.decorator";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { RequestUser } from "../auth/types/request-user.type";
import { BookingsService } from "./bookings.service";
import { BookingResponseDto } from "./dto/booking-response.dto";
import { CreateBookingDto } from "./dto/create-booking.dto";
import { BookingListItemDto } from "./dto/list-bookings.dto";
import { OwnerDashboardDto } from "./dto/owner-dashboard.dto";

@ApiTags("bookings")
@Controller("bookings")
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
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

  @Get("owner-dashboard")
  @Roles(UserRole.VENUE_OWNER, UserRole.VENUE_ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get venue owner dashboard summary" })
  @ApiOkResponse({ type: OwnerDashboardDto })
  @ApiUnauthorizedResponse({ description: "Authentication required" })
  ownerDashboard(@CurrentUser() user: RequestUser) {
    return this.bookingsService.getOwnerDashboard(user.id, user.role === UserRole.SUPER_ADMIN);
  }

  @Get(":id")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get current user's booking details" })
  @ApiOkResponse({ type: BookingResponseDto })
  @ApiUnauthorizedResponse({ description: "Authentication required" })
  @ApiNotFoundResponse({ description: "Booking not found" })
  findOne(@Param("id") id: string, @CurrentUser() user: RequestUser): Promise<BookingResponseDto> {
    return this.bookingsService.findBookingForUser(id, user.id);
  }

  @Patch(":id/cancel")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Cancel current user's booking and calculate refund eligibility" })
  @ApiOkResponse({ type: BookingResponseDto })
  @ApiUnauthorizedResponse({ description: "Authentication required" })
  @ApiBadRequestResponse({ description: "Booking cannot be cancelled" })
  @ApiNotFoundResponse({ description: "Booking not found" })
  cancel(@Param("id") id: string, @CurrentUser() user: RequestUser): Promise<BookingResponseDto> {
    return this.bookingsService.cancelBookingForUser(id, user.id);
  }

  @Get("me")
  @ApiBearerAuth()
  @ApiOperation({ summary: "List current user's bookings" })
  @ApiQuery({ name: "filter", enum: ["upcoming", "past", "cancelled"], required: false })
  @ApiOkResponse({ type: BookingListItemDto, isArray: true })
  @ApiUnauthorizedResponse({ description: "Authentication required" })
  async findUserBookings(
    @Query("filter") filter: "upcoming" | "past" | "cancelled" = "upcoming",
    @CurrentUser() user: RequestUser
  ) {
    return this.bookingsService.findBookingsForUser(user.id, filter);
  }
}
