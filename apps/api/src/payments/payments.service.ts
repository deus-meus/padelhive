import { BadRequestException, ForbiddenException, Inject, Injectable, NotFoundException, Logger } from "@nestjs/common";
import { BookingStatus, CourtType, PaymentStatus, NotificationType } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { CreatePaymentIntentDto } from "./dto/create-payment-intent.dto";
import { PaymentResponseDto } from "./dto/payment-response.dto";
import { MidtransWebhookDto } from "./dto/midtrans-webhook.dto";
import { PAYMENT_GATEWAY_TOKEN, PaymentGateway } from "./gateways/payment-gateway.interface";
import * as crypto from "crypto";
import { NotificationsService, CreateNotificationInput } from "../notifications/notifications.service";

const SUPPORTED_METHODS = ["va", "ewallet", "card"];
const SUPPORTED_PROVIDERS = ["internal", "midtrans"];

const paymentSelect = {
  id: true,
  bookingId: true,
  amount: true,
  status: true,
  provider: true,
  method: true,
  providerReference: true,
  providerRedirectUrl: true,
  providerToken: true,
  paidAt: true,
  failedAt: true,
  createdAt: true,
  updatedAt: true,
  booking: {
    select: {
      id: true,
      bookingDate: true,
      startsAt: true,
      endsAt: true,
      durationMinutes: true,
      status: true,
      hostUserId: true,
      venue: { select: { id: true, name: true, city: true } },
      court: { select: { id: true, name: true, type: true } },
    },
  },
};

type SelectedPayment = {
  id: string;
  bookingId: string;
  amount: number;
  status: PaymentStatus;
  provider: string;
  method: string;
  providerReference: string | null;
  providerRedirectUrl: string | null;
  providerToken: string | null;
  paidAt: Date | null;
  failedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  booking: {
    id: string;
    bookingDate: Date;
    startsAt: Date;
    endsAt: Date;
    durationMinutes: number;
    status: BookingStatus;
    hostUserId: string;
    venue: { id: string; name: string; city: string };
    court: { id: string; name: string; type: CourtType };
  };
};

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private readonly prisma: PrismaService,
    @Inject(PAYMENT_GATEWAY_TOKEN)
    private readonly paymentGateway: PaymentGateway,
    private readonly notifications: NotificationsService
  ) {}

  private async safeNotify(input: CreateNotificationInput) {
    try {
      await this.notifications.createNotification(input);
    } catch (err) {
      this.logger.warn(`Failed to emit notification: ${String(err)}`);
    }
  }

  async createIntentForUser(userId: string, body: CreatePaymentIntentDto): Promise<PaymentResponseDto> {
    this.assertSupportedMethod(body.method);
    this.assertSupportedProvider(body.provider);

    const booking = await this.prisma.booking.findFirst({
      where: { id: body.bookingId, hostUserId: userId },
      select: { id: true, finalAmount: true, status: true },
    });

    if (!booking) {
      throw new NotFoundException("Booking not found");
    }

    if (
      booking.status === BookingStatus.CANCELLED ||
      booking.status === BookingStatus.EXPIRED ||
      booking.status === BookingStatus.COMPLETED
    ) {
      throw new BadRequestException("Booking cannot be paid");
    }

    const splitCount = await this.prisma.bookingSplitShare.count({ where: { bookingId: booking.id } });
    if (splitCount > 0) {
      throw new BadRequestException("This booking is split; pay each share individually.");
    }

    const pendingPayment = await this.prisma.payment.findFirst({
      where: { bookingId: booking.id, status: PaymentStatus.PENDING, provider: body.provider },
      select: paymentSelect,
    });

    if (pendingPayment) {
      return this.stripHostUserId(pendingPayment);
    }

    const payment = await this.prisma.payment.create({
      data: {
        bookingId: booking.id,
        amount: booking.finalAmount,
        status: PaymentStatus.PENDING,
        provider: body.provider,
        method: body.method,
      },
    });

    let redirectUrl = null;
    let token = null;
    let providerReference = null;

    if (body.provider === "midtrans") {
      try {
        const result = await this.paymentGateway.createTransaction({
          orderId: payment.id,
          amount: booking.finalAmount,
          method: body.method,
        });
        redirectUrl = result.redirectUrl || null;
        token = result.token || null;
        providerReference = result.providerReference;

        await this.prisma.payment.update({
          where: { id: payment.id },
          data: {
            providerReference,
            providerRedirectUrl: redirectUrl,
            providerToken: token,
          },
        });
      } catch (error) {
        await this.prisma.payment.delete({ where: { id: payment.id } });
        throw error;
      }
    }

    const finalPayment = await this.prisma.payment.findUniqueOrThrow({
      where: { id: payment.id },
      select: paymentSelect,
    });

    return this.stripHostUserId(finalPayment);
  }

  async findPaymentForUser(id: string, userId: string): Promise<PaymentResponseDto> {
    const payment = await this.prisma.payment.findFirst({
      where: { id, booking: { hostUserId: userId } },
      select: paymentSelect,
    });

    if (!payment) {
      throw new NotFoundException("Payment not found");
    }

    return this.stripHostUserId(payment);
  }

  async markPaidForUser(id: string, userId: string): Promise<PaymentResponseDto> {
    const payment = await this.prisma.payment.findFirst({
      where: { id },
      select: paymentSelect,
    });

    if (!payment) {
      throw new NotFoundException("Payment not found");
    }

    if (payment.booking.hostUserId !== userId) {
      throw new ForbiddenException("Payment does not belong to current user");
    }

    if (payment.status !== PaymentStatus.PENDING) {
      throw new BadRequestException("Only pending demo payments can be marked as paid");
    }

    if (payment.booking.status !== BookingStatus.PENDING_PAYMENT) {
      throw new BadRequestException("Only pending-payment bookings can be confirmed");
    }

    const splitCount = await this.prisma.bookingSplitShare.count({ where: { bookingId: payment.bookingId } });
    if (splitCount > 0) {
      throw new BadRequestException("This booking is split; pay each share individually.");
    }

    const paidPayment = await this.prisma.$transaction(async (tx) => {
      await tx.booking.update({
        where: { id: payment.bookingId },
        data: { status: BookingStatus.CONFIRMED, expiresAt: null },
      });

      return tx.payment.update({
        where: { id: payment.id },
        data: { status: PaymentStatus.PAID, paidAt: new Date() },
        select: paymentSelect,
      });
    });

    await this.safeNotify({ userId: payment.booking.hostUserId, type: NotificationType.PAYMENT_SUCCESS, title: "Payment successful", body: "Your payment was received and your booking is confirmed.", linkUrl: `/bookings/${payment.bookingId}` });
    await this.safeNotify({ userId: payment.booking.hostUserId, type: NotificationType.BOOKING_CONFIRMED, title: "Booking confirmed", body: "Your court booking is confirmed.", linkUrl: `/bookings/${payment.bookingId}` });

    return this.stripHostUserId(paidPayment);
  }

  async handleMidtransWebhook(payload: MidtransWebhookDto): Promise<void> {
    const serverKey = process.env.MIDTRANS_SERVER_KEY || "";
    const hashString = `${payload.order_id}${payload.status_code}${payload.gross_amount}${serverKey}`;
    const hash = crypto.createHash("sha512").update(hashString).digest("hex");

    if (!payload.signature_key || payload.signature_key.length !== hash.length) {
      throw new BadRequestException("Invalid signature length");
    }

    const isValid = crypto.timingSafeEqual(Buffer.from(payload.signature_key), Buffer.from(hash));
    if (!isValid) {
      throw new BadRequestException("Invalid signature");
    }

    const payment = await this.prisma.payment.findFirst({
      where: { id: payload.order_id },
      include: { booking: true },
    });

    const { transaction_status, fraud_status } = payload;

    if (!payment) {
      const share = await this.prisma.bookingSplitShare.findFirst({
        where: { providerReference: payload.order_id },
        include: { booking: true },
      });
      if (!share) return;
      if (share.status === "PAID") return;

      let shareTargetStatus: "PAID" | null = null;
      let shareTargetBookingStatus: BookingStatus | null = null;

      if (transaction_status === "settlement" || transaction_status === "capture") {
        if (transaction_status === "capture" && fraud_status === "challenge") {
          return;
        }
        shareTargetStatus = "PAID";
        shareTargetBookingStatus = BookingStatus.CONFIRMED;
      } else if (["deny", "cancel", "expire", "pending"].includes(transaction_status)) {
        return;
      }

      if (!shareTargetStatus) return;

      let bookingJustConfirmed = false;
      await this.prisma.$transaction(async (tx) => {
        await tx.bookingSplitShare.update({
          where: { id: share.id },
          data: { status: shareTargetStatus as "PAID", paidAt: new Date() },
        });

        const remaining = await tx.bookingSplitShare.count({
          where: { bookingId: share.bookingId, status: { not: "PAID" } },
        });

        if (remaining === 0 && share.booking.status === BookingStatus.PENDING_PAYMENT) {
          await tx.booking.update({
            where: { id: share.bookingId },
            data: { status: BookingStatus.CONFIRMED, expiresAt: null },
          });
          bookingJustConfirmed = true;
        }
      });

      await this.safeNotify({ userId: share.booking.hostUserId, type: NotificationType.PAYMENT_SUCCESS, title: "Payment successful", body: "A split share was paid.", linkUrl: `/bookings/${share.bookingId}` });

      if (bookingJustConfirmed) {
        await this.safeNotify({ userId: share.booking.hostUserId, type: NotificationType.BOOKING_CONFIRMED, title: "Booking confirmed", body: "Your court booking is confirmed.", linkUrl: `/bookings/${share.bookingId}` });
      }

      return;
    }

    if (
      payment.status === PaymentStatus.PAID ||
      payment.status === PaymentStatus.FAILED ||
      payment.status === PaymentStatus.REFUNDED
    ) {
      return;
    }

    let targetPaymentStatus: PaymentStatus | null = null;
    let targetBookingStatus: BookingStatus | null = null;

    if (transaction_status === "settlement" || transaction_status === "capture") {
      if (transaction_status === "capture" && fraud_status === "challenge") {
        return;
      }
      targetPaymentStatus = PaymentStatus.PAID;
      targetBookingStatus = BookingStatus.CONFIRMED;
    } else if (["deny", "cancel", "expire"].includes(transaction_status)) {
      targetPaymentStatus = PaymentStatus.FAILED;
    } else if (transaction_status === "pending") {
      return;
    }

    if (!targetPaymentStatus) {
      return;
    }

    if (targetPaymentStatus === PaymentStatus.PAID && payment.booking.status !== BookingStatus.PENDING_PAYMENT) {
      this.logger.warn(
        `Settled payment landed on a non-payable booking and may need manual review/refund. Order ID: ${payment.id}, Booking ID: ${payment.bookingId}, Current Booking Status: ${payment.booking.status}`
      );
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: targetPaymentStatus!,
          paidAt: targetPaymentStatus === PaymentStatus.PAID ? new Date() : undefined,
          failedAt: targetPaymentStatus === PaymentStatus.FAILED ? new Date() : undefined,
        },
      });

      if (targetBookingStatus === BookingStatus.CONFIRMED && payment.booking.status === BookingStatus.PENDING_PAYMENT) {
        await tx.booking.update({
          where: { id: payment.bookingId },
          data: { status: targetBookingStatus, expiresAt: null },
        });
      }
    });

    if (targetPaymentStatus === PaymentStatus.PAID) {
      await this.safeNotify({ userId: payment.booking.hostUserId, type: NotificationType.PAYMENT_SUCCESS, title: "Payment successful", body: "Your payment was received.", linkUrl: `/bookings/${payment.bookingId}` });
      if (targetBookingStatus === BookingStatus.CONFIRMED && payment.booking.status === BookingStatus.PENDING_PAYMENT) {
        await this.safeNotify({ userId: payment.booking.hostUserId, type: NotificationType.BOOKING_CONFIRMED, title: "Booking confirmed", body: "Your court booking is confirmed.", linkUrl: `/bookings/${payment.bookingId}` });
      }
    } else if (targetPaymentStatus === PaymentStatus.FAILED) {
      await this.safeNotify({ userId: payment.booking.hostUserId, type: NotificationType.PAYMENT_FAILED, title: "Payment failed", body: "Your payment could not be completed.", linkUrl: `/bookings/${payment.bookingId}` });
    }
  }

  private assertSupportedMethod(method: string): void {
    if (!SUPPORTED_METHODS.includes(method)) {
      throw new BadRequestException("Unsupported payment method");
    }
  }

  private assertSupportedProvider(provider: string): void {
    if (!SUPPORTED_PROVIDERS.includes(provider)) {
      throw new BadRequestException("Unsupported payment provider");
    }
  }

  private stripHostUserId(payment: SelectedPayment): PaymentResponseDto {
    return {
      ...payment,
      booking: {
        id: payment.booking.id,
        bookingDate: payment.booking.bookingDate,
        startsAt: payment.booking.startsAt,
        endsAt: payment.booking.endsAt,
        durationMinutes: payment.booking.durationMinutes,
        status: payment.booking.status,
        venue: payment.booking.venue,
        court: payment.booking.court,
      },
    };
  }
}
