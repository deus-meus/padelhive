import { Controller, Get, Param, Query } from "@nestjs/common";
import { ApiBadRequestResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from "@nestjs/swagger";
import { VenueResponseDto } from "./dto/venue-response.dto";
import { VenueAvailabilityResponseDto } from "./dto/venue-availability-response.dto";
import { VenuesService } from "./venues.service";
import { AvailabilityService } from "./availability.service";

@ApiTags("venues")
@Controller("venues")
export class VenuesController {
  constructor(
    private readonly venuesService: VenuesService,
    private readonly availabilityService: AvailabilityService
  ) {}

  @Get(":id/availability")
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
  @ApiOperation({ summary: "List approved venues" })
  @ApiOkResponse({ type: VenueResponseDto, isArray: true })
  findAll(): Promise<VenueResponseDto[]> {
    return this.venuesService.findApprovedVenues();
  }

  @Get(":id")
  @ApiOperation({ summary: "Get approved venue details" })
  @ApiOkResponse({ type: VenueResponseDto })
  @ApiNotFoundResponse({ description: "Venue not found" })
  findOne(@Param("id") id: string): Promise<VenueResponseDto> {
    return this.venuesService.findApprovedVenueById(id);
  }
}
