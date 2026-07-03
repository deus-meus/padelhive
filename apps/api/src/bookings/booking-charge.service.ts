import { BadRequestException, Injectable, NotFoundException, Inject, Logger } from "@nestjs/common";
import { BookingStatus, PaymentStatus, NotificationType } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { ChargeResponseDto } from "./dto/charge-response.dto";
import { PAYMENT_GATEWAY_TOKEN } from "../payments/gateways/payment-gateway.interface";
import type { PaymentGateway } from "../payments/gateways/payment-gateway.interface";
import { NotificationsService, CreateNotificationInput } from "../notifications/notifications.service";

@Injectable()
export class BookingChargeService {
  private readonly logger = new Logger(BookingChargeService.name);

  constructor(
    private readonly prisma: PrismaService,
    @Inject(PAYMENT_GATEWAY_TOKEN) private readonly paymentGateway: PaymentGateway,
    private readonly notifications: NotificationsService
  ) {}

  private async safeNotify(input: CreateNotificationInput) {
    try {
      await this.notifications.createNotification(input);
    } catch (err) {
      this.logger.warn(`Failed to emit notification: ${String(err)}`);
    }
  }

  async createChargeIntent(bookingId: string, userId: string, method: string): Promise<ChargeResponseDto> {
    const booking = await this.prisma.booking.findFirst({
      where: { id: bookingId, hostUserId: userId },
    });

    if (!booking) {
      throw new NotFoundException("Booking not found");
    }

    const charge = await this.prisma.bookingCharge.findFirst({
      where: { bookingId, status: PaymentStatus.PENDING },
      orderBy: { createdAt: "desc" },
    });

    if (!charge) {
      throw new BadRequestException("No outstanding balance for this booking");
    }

    const SUPPORTED_METHODS = ["va", "ewallet", "card"];
    if (!SUPPORTED_METHODS.includes(method)) {
      throw new BadRequestException("Unsupported payment method");
    }

    if (charge.provider === "midtrans" && charge.providerReference && charge.providerRedirectUrl) {
      return {
        id: charge.id,
        bookingId: charge.bookingId,
        amount: charge.amount,
        status: charge.status,
        provider: charge.provider,
        method: charge.method,
        providerReference: charge.providerReference,
        providerRedirectUrl: charge.providerRedirectUrl,
        providerToken: charge.providerToken,
        paidAt: charge.paidAt,
      };
    }

    const result = await this.paymentGateway.createTransaction({
      orderId: charge.id,
      amount: charge.amount,
      method,
    });

    const updated = await this.prisma.bookingCharge.update({
      where: { id: charge.id },
      data: {
        method,
        providerReference: charge.id,
        providerRedirectUrl: result.redirectUrl ?? null,
        providerToken: result.token ?? null,
      },
    });

    return {
      id: updated.id,
      bookingId: updated.bookingId,
      amount: updated.amount,
      status: updated.status,
      provider: updated.provider,
      method: updated.method,
      providerReference: updated.providerReference,
      providerRedirectUrl: updated.providerRedirectUrl,
      providerToken: updated.providerToken,
      paidAt: updated.paidAt,
    };
  }

  async markChargePaidForUser(bookingId: string, userId: string): Promise<ChargeResponseDto> {
    const booking = await this.prisma.booking.findFirst({
      where: { id: bookingId, hostUserId: userId },
    });

    if (!booking) {
      throw new NotFoundException("Booking not found");
    }

    const charge = await this.prisma.bookingCharge.findFirst({
      where: { bookingId, status: PaymentStatus.PENDING },
      orderBy: { createdAt: "desc" },
    });

    if (!charge) {
      throw new BadRequestException("No outstanding balance for this booking");
    }

    const updated = await this.prisma.bookingCharge.update({
      where: { id: charge.id },
      data: {
        status: PaymentStatus.PAID,
        paidAt: new Date(),
      },
    });

    await this.safeNotify({
      userId,
      type: NotificationType.PAYMENT_SUCCESS,
      title: "Balance paid",
      body: "Balance paid",
      linkUrl: `/bookings/${bookingId}`,
    });

    return {
      id: updated.id,
      bookingId: updated.bookingId,
      amount: updated.amount,
      status: updated.status,
      provider: updated.provider,
      method: updated.method,
      providerReference: updated.providerReference,
      providerRedirectUrl: updated.providerRedirectUrl,
      providerToken: updated.providerToken,
      paidAt: updated.paidAt,
    };
  }
}
