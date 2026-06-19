import { Body, Controller, Get, Param, Query, Post, Patch } from "@nestjs/common";
import { ApiBadRequestResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiQuery, ApiTags, ApiBearerAuth, ApiCreatedResponse } from "@nestjs/swagger";
import { VenueResponseDto } from "./dto/venue-response.dto";
import { VenueAvailabilityResponseDto } from "./dto/venue-availability-response.dto";
import { CreateVenueDto } from "./dto/create-venue.dto";
import { UpdateVenueDto } from "./dto/update-venue.dto";
import { VenuesService } from "./venues.service";
import { AvailabilityService } from "./availability.service";
import { Public } from "../auth/decorators/public.decorator";
import { Roles } from "../auth/decorators/roles.decorator";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { RequestUser } from "../auth/types/request-user.type";
import { UserRole } from "@prisma/client";

@ApiTags("venues")
@Controller("venues")
export class VenuesController {
  constructor(
    private readonly venuesService: VenuesService,
    private readonly availabilityService: AvailabilityService
  ) {}

  @Get("manage")
  @Roles(UserRole.VENUE_OWNER, UserRole.VENUE_ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: "List all venues for management" })
  @ApiOkResponse({ type: VenueResponseDto, isArray: true })
  manage(@CurrentUser() user: RequestUser) {
    return this.venuesService.findVenuesForManagement(user.id, user.role === UserRole.SUPER_ADMIN);
  }

  @Get(":id/availability")
  @Public()
  @ApiOperation({ summary: "Get venue availability for a specific date" })
  @ApiQuery({ name: "date", required: true, description: "Date in YYYY-MM-DD format" })
  @ApiQuery({ name: "courtId", required: false, description: "Filter by specific court ID" })
  @ApiOkResponse({ type: VenueAvailabilityResponseDto })
  @ApiNotFoundResponse({ description: "Venue not found" })
  @ApiBadRequestResponse({ description: "Invalid date format" })
  async getAvailability(
    @Param("id") venueId: string,
    @Query("date") date: string,
    @Query("courtId") courtId?: string
  ): Promise<VenueAvailabilityResponseDto> {
    return this.availabilityService.getVenueAvailability(venueId, date, courtId);
  }

  @Get()
  @Public()
  @ApiOperation({ summary: "List approved venues" })
  @ApiOkResponse({ type: VenueResponseDto, isArray: true })
  findAll(
    @Query("q") q?: string,
    @Query("city") city?: string,
    @Query("priceMin") priceMin?: string,
    @Query("priceMax") priceMax?: string,
    @Query("rating") rating?: string,
    @Query("facilities") facilities?: string,
    @Query("type") type?: string
  ): Promise<VenueResponseDto[]> {
    return this.venuesService.findApprovedVenues({ q, city, priceMin, priceMax, rating, facilities, type });
  }

  @Post()
  @Roles(UserRole.VENUE_OWNER, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Create a new venue" })
  @ApiCreatedResponse({ type: VenueResponseDto })
  create(@Body() body: CreateVenueDto, @CurrentUser() user: RequestUser) {
    return this.venuesService.createVenue(user.id, body);
  }

  @Get(":id")
  @Public()
  @ApiOperation({ summary: "Get approved venue details" })
  @ApiOkResponse({ type: VenueResponseDto })
  @ApiNotFoundResponse({ description: "Venue not found" })
  findOne(@Param("id") id: string): Promise<VenueResponseDto> {
    return this.venuesService.findApprovedVenueById(id);
  }

  @Patch(":id")
  @Roles(UserRole.VENUE_OWNER, UserRole.VENUE_ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update venue details" })
  @ApiOkResponse({ type: VenueResponseDto })
  update(@Param("id") id: string, @Body() body: UpdateVenueDto, @CurrentUser() user: RequestUser) {
    return this.venuesService.updateVenue(id, user.id, user.role === UserRole.SUPER_ADMIN, body);
  }
}
