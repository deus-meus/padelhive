import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { BookingStatus, CourtType, PaymentStatus } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { CreatePaymentIntentDto } from "./dto/create-payment-intent.dto";
import { PaymentResponseDto } from "./dto/payment-response.dto";

const INTERNAL_PROVIDER = "internal";
const SUPPORTED_METHODS = ["va", "ewallet", "card"];

const paymentSelect = {
  id: true,
  bookingId: true,
  amount: true,
  status: true,
  provider: true,
  method: true,
  providerReference: true,
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
  constructor(private readonly prisma: PrismaService) {}

  async createIntentForUser(userId: string, body: CreatePaymentIntentDto): Promise<PaymentResponseDto> {
    this.assertSupportedMethod(body.method);

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

    const pendingPayment = await this.prisma.payment.findFirst({
      where: { bookingId: booking.id, status: PaymentStatus.PENDING },
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
        provider: INTERNAL_PROVIDER,
        method: body.method,
      },
      select: paymentSelect,
    });

    return this.stripHostUserId(payment);
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

  private assertSupportedMethod(method: string): void {
    if (!SUPPORTED_METHODS.includes(method)) {
      throw new BadRequestException("Unsupported payment method");
    }
  }

  private stripHostUserId(payment: SelectedPayment): PaymentResponseDto {
    const { hostUserId: _hostUserId, ...booking } = payment.booking;
    return { ...payment, booking };
  }
}
