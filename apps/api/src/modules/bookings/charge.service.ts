import { PaymentStatus } from "@prisma/client";
import { PrismaService, prisma as defaultPrisma } from "../../common/prisma";
import type { PaymentGateway } from "../payments/midtrans.gateway";
import { midtransGateway as defaultGateway } from "../payments/midtrans.gateway";
import { BadRequestException, NotFoundException } from "../../common/errors";

export class BookingChargeService {
  constructor(
    private readonly prisma: PrismaService = defaultPrisma,
    private readonly paymentGateway: PaymentGateway = defaultGateway
  ) {}

  async createChargeIntent(bookingId: string, userId: string, method: string) {
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

    if (charge.providerReference && charge.providerRedirectUrl) {
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

  async markChargePaidForUser(bookingId: string, userId: string) {
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

export const bookingChargeService = new BookingChargeService();
