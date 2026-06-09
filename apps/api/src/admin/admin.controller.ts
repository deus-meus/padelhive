import { Controller, Get, Query, Param, Patch, Body } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags, ApiOkResponse, ApiQuery } from "@nestjs/swagger";
import { UserRole, VenueStatus } from "@prisma/client";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { Roles } from "../auth/decorators/roles.decorator";
import { RequestUser } from "../auth/types/request-user.type";
import { AdminService } from "./admin.service";
import { GetAdminBookingsDto } from "./dto/get-admin-bookings.dto";
import { AdminOverviewDto } from "./dto/admin-overview.dto";
import { VenuesService } from "../venues/venues.service";
import { VenueResponseDto } from "../venues/dto/venue-response.dto";
import { UpdateVenueStatusDto } from "./dto/update-venue-status.dto";

@ApiTags("admin")
@ApiBearerAuth()
@Controller("admin")
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly venuesService: VenuesService
  ) {}

  @Get("me")
  @Roles(UserRole.SUPER_ADMIN)
  me(@CurrentUser() user: RequestUser) {
    return user;
  }

  @Get("overview")
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: "Platform-wide admin overview metrics" })
  @ApiOkResponse({ type: AdminOverviewDto })
  getOverview() {
    return this.adminService.getOverview();
  }

  @Get("bookings")
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: "List all bookings for admin dashboard" })
  getBookings(@Query() query: GetAdminBookingsDto) {
    return this.adminService.getBookings(query);
  }

  @Get("venues")
  @Roles(UserRole.SUPER_ADMIN)
  @ApiQuery({ name: "status", enum: VenueStatus, required: false })
  @ApiOkResponse({ type: VenueResponseDto, isArray: true })
  listVenues(@Query("status") status?: VenueStatus) {
    return this.venuesService.findVenuesForAdmin(status);
  }

  @Patch("venues/:id/status")
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOkResponse({ type: VenueResponseDto })
  updateVenueStatus(@Param("id") id: string, @Body() body: UpdateVenueStatusDto) {
    return this.venuesService.setVenueStatus(id, body.status);
  }
}
