import { Controller, Get, Query, Param, Patch, Body, Post, Delete } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags, ApiOkResponse, ApiQuery, ApiCreatedResponse } from "@nestjs/swagger";
import { UserRole, VenueStatus, DisputeStatus } from "@prisma/client";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { Roles } from "../auth/decorators/roles.decorator";
import { RequestUser } from "../auth/types/request-user.type";
import { AdminService } from "./admin.service";
import { GetAdminBookingsDto } from "./dto/get-admin-bookings.dto";
import { AdminOverviewDto } from "./dto/admin-overview.dto";
import { GetCommissionDto } from "./dto/get-commission.dto";
import { CommissionReportDto } from "./dto/commission-report.dto";
import { AdminMetricsDto } from "./dto/admin-metrics.dto";
import { VenuesService } from "../venues/venues.service";
import { VenueResponseDto } from "../venues/dto/venue-response.dto";
import { UpdateVenueStatusDto } from "./dto/update-venue-status.dto";
import { VouchersService } from "../vouchers/vouchers.service";
import { VoucherResponseDto } from "../vouchers/dto/voucher-response.dto";
import { CreateVoucherDto } from "../vouchers/dto/create-voucher.dto";
import { UpdateVoucherDto } from "../vouchers/dto/update-voucher.dto";
import { DisputesService } from "../disputes/disputes.service";
import { ResolveDisputeDto } from "../disputes/dto/resolve-dispute.dto";

@ApiTags("admin")
@ApiBearerAuth()
@Controller("admin")
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly venuesService: VenuesService,
    private readonly vouchersService: VouchersService,
    private readonly disputesService: DisputesService
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

  @Get("commission")
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: "Per-venue platform commission report" })
  @ApiOkResponse({ type: CommissionReportDto })
  getCommission(@Query() query: GetCommissionDto) {
    return this.adminService.getCommission(query);
  }

  @Get("metrics")
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: "Platform metrics report" })
  @ApiOkResponse({ type: AdminMetricsDto })
  getMetrics() {
    return this.adminService.getMetrics();
  }

  @Get("vouchers")
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: "List all vouchers (admin)" })
  @ApiOkResponse({ type: VoucherResponseDto, isArray: true })
  listVouchers(): Promise<VoucherResponseDto[]> {
    return this.vouchersService.findAllForAdmin();
  }

  @Post("vouchers")
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: "Create a voucher (admin)" })
  @ApiCreatedResponse({ type: VoucherResponseDto })
  createVoucher(@Body() body: CreateVoucherDto): Promise<VoucherResponseDto> {
    return this.vouchersService.createVoucher(body);
  }

  @Patch("vouchers/:id")
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: "Update a voucher (admin)" })
  @ApiOkResponse({ type: VoucherResponseDto })
  updateVoucher(@Param("id") id: string, @Body() body: UpdateVoucherDto): Promise<VoucherResponseDto> {
    return this.vouchersService.updateVoucher(id, body);
  }

  @Delete("vouchers/:id")
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: "Delete a voucher (admin)" })
  deleteVoucher(@Param("id") id: string): Promise<{ id: string }> {
    return this.vouchersService.deleteVoucher(id);
  }

  @Get("disputes")
  @Roles(UserRole.SUPER_ADMIN)
  @ApiQuery({ name: "status", enum: DisputeStatus, required: false })
  listDisputes(@Query("status") status?: DisputeStatus) {
    return this.disputesService.findAllForAdmin(status);
  }

  @Patch("disputes/:id/assign")
  @Roles(UserRole.SUPER_ADMIN)
  assignDispute(@Param("id") id: string, @CurrentUser() user: RequestUser) {
    return this.disputesService.assignDispute(id, user.id);
  }

  @Patch("disputes/:id/resolve")
  @Roles(UserRole.SUPER_ADMIN)
  resolveDispute(@Param("id") id: string, @CurrentUser() user: RequestUser, @Body() dto: ResolveDisputeDto) {
    return this.disputesService.resolveDispute(id, user.id, dto.resolutionNotes);
  }

  @Patch("disputes/:id/close")
  @Roles(UserRole.SUPER_ADMIN)
  closeDispute(@Param("id") id: string, @CurrentUser() user: RequestUser) {
    return this.disputesService.closeDispute(id, user.id);
  }
}
