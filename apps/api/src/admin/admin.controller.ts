import { Controller, Get, Query } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { UserRole } from "@prisma/client";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { Roles } from "../auth/decorators/roles.decorator";
import { RequestUser } from "../auth/types/request-user.type";
import { AdminService } from "./admin.service";
import { GetAdminBookingsDto } from "./dto/get-admin-bookings.dto";

@ApiTags("admin")
@ApiBearerAuth()
@Controller("admin")
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get("me")
  @Roles(UserRole.SUPER_ADMIN)
  me(@CurrentUser() user: RequestUser) {
    return user;
  }

  @Get("bookings")
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: "List all bookings for admin dashboard" })
  getBookings(@Query() query: GetAdminBookingsDto) {
    return this.adminService.getBookings(query);
  }
}
