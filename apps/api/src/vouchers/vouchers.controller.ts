import { Body, Controller, Get, Post } from "@nestjs/common";
import { ApiBadRequestResponse, ApiCreatedResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { VoucherResponseDto } from "./dto/voucher-response.dto";
import { VouchersService } from "./vouchers.service";
import { ValidateVoucherDto } from "./dto/validate-voucher.dto";
import { VoucherValidationResponseDto } from "./dto/voucher-validation-response.dto";

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

  @Post("validate")
  @ApiOperation({ summary: "Validate a voucher code against a subtotal and preview the discount" })
  @ApiCreatedResponse({ type: VoucherValidationResponseDto })
  @ApiBadRequestResponse({ description: "Voucher is not applicable" })
  @ApiNotFoundResponse({ description: "Voucher not found" })
  async validate(@Body() body: ValidateVoucherDto): Promise<VoucherValidationResponseDto> {
    const priced = await this.vouchersService.priceVoucher(body.code, body.amount);
    return { code: priced.code, type: priced.type, discount: priced.discount, finalAmount: body.amount - priced.discount };
  }
}
