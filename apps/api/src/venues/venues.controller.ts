import { Controller, Get, Param } from "@nestjs/common";
import { ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { VenueResponseDto } from "./dto/venue-response.dto";
import { VenuesService } from "./venues.service";

@ApiTags("venues")
@Controller("venues")
export class VenuesController {
  constructor(private readonly venuesService: VenuesService) {}

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
