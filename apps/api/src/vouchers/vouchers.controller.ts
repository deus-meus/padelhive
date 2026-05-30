import { Controller, Get } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { VoucherResponseDto } from "./dto/voucher-response.dto";
import { VouchersService } from "./vouchers.service";

@ApiTags("vouchers")
@Controller("vouchers")
export class VouchersController {
  constructor(private readonly vouchersService: VouchersService) {}

  @Get()
  @ApiOperation({ summary: "List active vouchers" })
  @ApiOkResponse({ type: VoucherResponseDto, isArray: true })
  findAll(): Promise<VoucherResponseDto[]> {
    return this.vouchersService.findActiveVouchers();
  }
}
