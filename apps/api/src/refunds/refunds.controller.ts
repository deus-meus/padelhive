import { Body, Controller, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { RefundsService } from "./refunds.service";
import { CreateRefundDto } from "./dto/create-refund.dto";
import { ApproveRefundDto } from "./dto/approve-refund.dto";
import { RejectRefundDto } from "./dto/reject-refund.dto";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { RequestUser } from "../auth/types/request-user.type";
import { Roles } from "../auth/decorators/roles.decorator";
import { RefundStatus, UserRole } from "@prisma/client";

@Controller("refunds")
export class RefundsController {
  constructor(private readonly refundsService: RefundsService) {}

  @Post()
  createRefund(@CurrentUser() user: RequestUser, @Body() dto: CreateRefundDto) {
    return this.refundsService.createRefund(user.id, dto);
  }

  @Get("me")
  findMyRefunds(@CurrentUser() user: RequestUser) {
    return this.refundsService.findMyRefunds(user.id);
  }

  @Roles(UserRole.SUPER_ADMIN)
  @Get()
  findAllRefunds(@Query("status") status?: RefundStatus) {
    return this.refundsService.findAllRefunds(status);
  }

  @Get(":id")
  findRefundById(@Param("id") id: string, @CurrentUser() user: RequestUser) {
    const isSuperAdmin = user.role === UserRole.SUPER_ADMIN;
    return this.refundsService.findRefundById(id, user.id, isSuperAdmin);
  }

  @Get(":id/history")
  findRefundHistory(@Param("id") id: string, @CurrentUser() user: RequestUser) {
    const isSuperAdmin = user.role === UserRole.SUPER_ADMIN;
    return this.refundsService.findRefundHistory(id, user.id, isSuperAdmin);
  }

  @Roles(UserRole.SUPER_ADMIN)
  @Patch(":id/approve")
  approveRefund(@Param("id") id: string, @CurrentUser() user: RequestUser, @Body() dto: ApproveRefundDto) {
    return this.refundsService.approveRefund(id, user.id, dto.adminNotes);
  }

  @Roles(UserRole.SUPER_ADMIN)
  @Patch(":id/reject")
  rejectRefund(@Param("id") id: string, @CurrentUser() user: RequestUser, @Body() dto: RejectRefundDto) {
    return this.refundsService.rejectRefund(id, user.id, dto.adminNotes);
  }

  @Roles(UserRole.SUPER_ADMIN)
  @Patch(":id/process")
  processRefund(@Param("id") id: string, @CurrentUser() user: RequestUser) {
    return this.refundsService.processRefund(id, user.id);
  }
}
