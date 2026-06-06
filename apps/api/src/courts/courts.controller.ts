import { Controller, Get, Param } from "@nestjs/common";
import { ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { CourtResponseDto } from "./dto/court-response.dto";
import { CourtsService } from "./courts.service";
import { Public } from "../auth/decorators/public.decorator";

@ApiTags("courts")
@Controller("venues/:venueId/courts")
export class CourtsController {
  constructor(private readonly courtsService: CourtsService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: "List active courts for an approved venue" })
  @ApiOkResponse({ type: CourtResponseDto, isArray: true })
  @ApiNotFoundResponse({ description: "Venue not found" })
  findForVenue(@Param("venueId") venueId: string): Promise<CourtResponseDto[]> {
    return this.courtsService.findActiveCourtsForApprovedVenue(venueId);
  }
}
