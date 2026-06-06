import { Body, Controller, Get, HttpCode, HttpStatus, Param, Patch, Post } from "@nestjs/common";
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { RequestUser } from "../auth/types/request-user.type";
import { Public } from "../auth/decorators/public.decorator";
import { CreatePaymentIntentDto } from "./dto/create-payment-intent.dto";
import { PaymentResponseDto } from "./dto/payment-response.dto";
import { MidtransWebhookDto } from "./dto/midtrans-webhook.dto";
import { PaymentsService } from "./payments.service";

@ApiTags("payments")
@Controller("payments")
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post("intents")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Create or reuse an internal pending payment intent" })
  @ApiCreatedResponse({ type: PaymentResponseDto })
  @ApiUnauthorizedResponse({ description: "Authentication required" })
  @ApiBadRequestResponse({ description: "Invalid payment intent request" })
  @ApiNotFoundResponse({ description: "Booking not found" })
  createIntent(@Body() body: CreatePaymentIntentDto, @CurrentUser() user: RequestUser): Promise<PaymentResponseDto> {
    return this.paymentsService.createIntentForUser(user.id, body);
  }

  @Get(":id")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get current user's payment details" })
  @ApiOkResponse({ type: PaymentResponseDto })
  @ApiUnauthorizedResponse({ description: "Authentication required" })
  @ApiNotFoundResponse({ description: "Payment not found" })
  findOne(@Param("id") id: string, @CurrentUser() user: RequestUser): Promise<PaymentResponseDto> {
    return this.paymentsService.findPaymentForUser(id, user.id);
  }

  @Patch(":id/mark-paid")
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Mark an internal demo payment as paid",
    description: "Demo-only endpoint. Confirms the related booking without calling a real payment provider.",
  })
  @ApiOkResponse({ type: PaymentResponseDto })
  @ApiUnauthorizedResponse({ description: "Authentication required" })
  @ApiForbiddenResponse({ description: "Payment does not belong to current user" })
  @ApiBadRequestResponse({ description: "Payment or booking is not in a demo-payable state" })
  @ApiNotFoundResponse({ description: "Payment not found" })
  markPaid(@Param("id") id: string, @CurrentUser() user: RequestUser): Promise<PaymentResponseDto> {
    return this.paymentsService.markPaidForUser(id, user.id);
  }

  @Post("webhook")
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Midtrans webhook handler" })
  @ApiOkResponse({ description: "Webhook processed" })
  async handleWebhook(@Body() payload: MidtransWebhookDto): Promise<void> {
    await this.paymentsService.handleMidtransWebhook(payload);
  }
}
