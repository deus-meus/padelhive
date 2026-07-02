import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Put, Query } from "@nestjs/common";
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
  ApiForbiddenResponse,
} from "@nestjs/swagger";
import { UserRole } from "@prisma/client";
import { Roles } from "../auth/decorators/roles.decorator";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { RequestUser } from "../auth/types/request-user.type";
import { BookingsService } from "./bookings.service";
import { BookingResponseDto } from "./dto/booking-response.dto";
import { CreateBookingDto } from "./dto/create-booking.dto";
import { RescheduleBookingDto } from "./dto/reschedule-booking.dto";
import { BookingListItemDto } from "./dto/list-bookings.dto";
import { OwnerDashboardDto } from "./dto/owner-dashboard.dto";
import { RevenueDto } from "./dto/revenue.dto";
import { BookingSplitService } from "./booking-split.service";
import { SetBookingSplitDto } from "./dto/create-split.dto";
import { UpdateSplitShareStatusDto } from "./dto/update-split-share.dto";
import { BookingSplitDto, SharePaymentIntentDto } from "./dto/split-response.dto";
import { CreateSharePaymentDto } from "./dto/create-share-payment.dto";
@ApiTags("bookings")
@Controller("bookings")
export class BookingsController {
  constructor(
    private readonly bookingsService: BookingsService,
    private readonly bookingSplitService: BookingSplitService
  ) {}

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

  @Get("revenue")
  @Roles(UserRole.VENUE_OWNER, UserRole.VENUE_ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get venue owner revenue analytics" })
  @ApiOkResponse({ type: RevenueDto })
  @ApiUnauthorizedResponse({ description: "Authentication required" })
  revenue(@CurrentUser() user: RequestUser) {
    return this.bookingsService.getRevenue(user.id, user.role === UserRole.SUPER_ADMIN);
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

  @Patch(":id/reschedule")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Reschedule a booking to a new time on the same court" })
  @ApiOkResponse({ type: BookingResponseDto })
  @ApiBadRequestResponse({ description: "Booking cannot be rescheduled" })
  @ApiConflictResponse({ description: "Court is unavailable for the requested time" })
  @ApiNotFoundResponse({ description: "Booking not found" })
  reschedule(@Param("id") id: string, @Body() body: RescheduleBookingDto, @CurrentUser() user: RequestUser): Promise<BookingResponseDto> {
    return this.bookingsService.rescheduleBookingForUser(id, user.id, body);
  }

  @Get(":id/split")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get the settlement ledger for a booking" })
  @ApiOkResponse({ type: BookingSplitDto })
  @ApiUnauthorizedResponse({ description: "Authentication required" })
  @ApiForbiddenResponse({ description: "Only the booking host can manage the split ledger" })
  @ApiNotFoundResponse({ description: "Booking not found" })
  getSplit(@Param("id") id: string, @CurrentUser() user: RequestUser): Promise<BookingSplitDto> {
    return this.bookingSplitService.getSplit(id, user.id);
  }

  @Put(":id/split")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Replace the settlement ledger for a booking" })
  @ApiOkResponse({ type: BookingSplitDto })
  @ApiUnauthorizedResponse({ description: "Authentication required" })
  @ApiForbiddenResponse({ description: "Only the booking host can manage the split ledger" })
  @ApiBadRequestResponse({ description: "Invalid split request" })
  @ApiNotFoundResponse({ description: "Booking not found" })
  setSplit(
    @Param("id") id: string,
    @Body() body: SetBookingSplitDto,
    @CurrentUser() user: RequestUser
  ): Promise<BookingSplitDto> {
    return this.bookingSplitService.setSplit(id, user.id, body);
  }

  @Delete(":id/split")
  @ApiBearerAuth()
  @HttpCode(204)
  @ApiOperation({ summary: "Clear the settlement ledger for a booking" })
  @ApiUnauthorizedResponse({ description: "Authentication required" })
  @ApiForbiddenResponse({ description: "Only the booking host can manage the split ledger" })
  @ApiNotFoundResponse({ description: "Booking not found" })
  clearSplit(@Param("id") id: string, @CurrentUser() user: RequestUser): Promise<void> {
    return this.bookingSplitService.clearSplit(id, user.id);
  }

  @Patch(":id/split/:shareId")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update the status of a specific split share" })
  @ApiOkResponse({ type: BookingSplitDto })
  @ApiUnauthorizedResponse({ description: "Authentication required" })
  @ApiForbiddenResponse({ description: "Only the booking host can manage the split ledger" })
  @ApiBadRequestResponse({ description: "Invalid status" })
  @ApiNotFoundResponse({ description: "Booking or share not found" })
  setShareStatus(
    @Param("id") id: string,
    @Param("shareId") shareId: string,
    @Body() body: UpdateSplitShareStatusDto,
    @CurrentUser() user: RequestUser
  ): Promise<BookingSplitDto> {
    return this.bookingSplitService.setShareStatus(id, shareId, user.id, body.status);
  }

  @Post(":id/split/:shareId/pay")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Create a payment intent for a split share" })
  @ApiOkResponse({ type: SharePaymentIntentDto })
  @ApiUnauthorizedResponse({ description: "Authentication required" })
  @ApiForbiddenResponse({ description: "Only the booking host can manage the split ledger" })
  @ApiBadRequestResponse({ description: "Invalid split request" })
  @ApiNotFoundResponse({ description: "Booking or share not found" })
  createSharePaymentIntent(
    @Param("id") id: string,
    @Param("shareId") shareId: string,
    @Body() body: CreateSharePaymentDto,
    @CurrentUser() user: RequestUser
  ): Promise<SharePaymentIntentDto> {
    return this.bookingSplitService.createSharePaymentIntent(id, shareId, user.id, body.method);
  }
}
