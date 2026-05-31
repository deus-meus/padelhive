import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { FirebaseAuthGuard } from "../auth/guards/firebase-auth.guard";
import { RequestUser } from "../auth/types/request-user.type";
import { CreatePaymentIntentDto } from "./dto/create-payment-intent.dto";
import { PaymentResponseDto } from "./dto/payment-response.dto";
import { PaymentsService } from "./payments.service";

@ApiTags("payments")
@Controller("payments")
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post("intents")
  @UseGuards(FirebaseAuthGuard)
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
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get current user's payment details" })
  @ApiOkResponse({ type: PaymentResponseDto })
  @ApiUnauthorizedResponse({ description: "Authentication required" })
  @ApiNotFoundResponse({ description: "Payment not found" })
  findOne(@Param("id") id: string, @CurrentUser() user: RequestUser): Promise<PaymentResponseDto> {
    return this.paymentsService.findPaymentForUser(id, user.id);
  }
}
