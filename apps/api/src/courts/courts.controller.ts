import { Body, Controller, Get, Param, Patch, Post } from "@nestjs/common";
import { ApiBearerAuth, ApiCreatedResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { CourtResponseDto } from "./dto/court-response.dto";
import { CourtsService } from "./courts.service";
import { Public } from "../auth/decorators/public.decorator";
import { Roles } from "../auth/decorators/roles.decorator";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { RequestUser } from "../auth/types/request-user.type";
import { UserRole } from "@prisma/client";
import { CreateCourtDto } from "./dto/create-court.dto";
import { UpdateCourtDto } from "./dto/update-court.dto";

@ApiTags("courts")
@Controller("venues/:venueId/courts")
export class CourtsController {
  constructor(private readonly courtsService: CourtsService) {}

  @Get("manage")
  @Roles(UserRole.VENUE_OWNER, UserRole.VENUE_ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: "List all courts (incl. inactive) for management" })
  @ApiOkResponse({ type: CourtResponseDto, isArray: true })
  manageList(@Param("venueId") venueId: string, @CurrentUser() user: RequestUser) {
    return this.courtsService.findCourtsForManagement(venueId, user.id, user.role === UserRole.SUPER_ADMIN);
  }

  @Post()
  @Roles(UserRole.VENUE_OWNER, UserRole.VENUE_ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Create a court for a venue" })
  @ApiCreatedResponse({ type: CourtResponseDto })
  create(@Param("venueId") venueId: string, @Body() body: CreateCourtDto, @CurrentUser() user: RequestUser) {
    return this.courtsService.createCourt(venueId, user.id, user.role === UserRole.SUPER_ADMIN, body);
  }

  @Patch(":courtId")
  @Roles(UserRole.VENUE_OWNER, UserRole.VENUE_ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update a court" })
  @ApiOkResponse({ type: CourtResponseDto })
  update(@Param("venueId") venueId: string, @Param("courtId") courtId: string, @Body() body: UpdateCourtDto, @CurrentUser() user: RequestUser) {
    return this.courtsService.updateCourt(venueId, courtId, user.id, user.role === UserRole.SUPER_ADMIN, body);
  }

  @Get()
  @Public()
  @ApiOperation({ summary: "List active courts for an approved venue" })
  @ApiOkResponse({ type: CourtResponseDto, isArray: true })
  @ApiNotFoundResponse({ description: "Venue not found" })
  findForVenue(@Param("venueId") venueId: string): Promise<CourtResponseDto[]> {
    return this.courtsService.findActiveCourtsForApprovedVenue(venueId);
  }
}
