import { Controller, Get, Post, Body } from "@nestjs/common";
import { DisputesService } from "./disputes.service";
import { CreateDisputeDto } from "./dto/create-dispute.dto";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { RequestUser } from "../auth/types/request-user.type";
import { ApiTags, ApiBearerAuth, ApiOperation } from "@nestjs/swagger";

@ApiTags("Disputes")
@ApiBearerAuth()
@Controller("disputes")
export class DisputesController {
  constructor(private readonly disputesService: DisputesService) {}

  @Post()
  @ApiOperation({ summary: "Create a new dispute" })
  createDispute(@CurrentUser() user: RequestUser, @Body() dto: CreateDisputeDto) {
    return this.disputesService.createDispute(user.id, dto);
  }

  @Get("me")
  @ApiOperation({ summary: "Get my disputes" })
  findMyDisputes(@CurrentUser() user: RequestUser) {
    return this.disputesService.findMyDisputes(user.id);
  }
}
