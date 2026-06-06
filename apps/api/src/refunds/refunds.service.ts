import { BadRequestException, ConflictException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { BookingStatus, PaymentStatus, RefundStatus, Prisma } from "@prisma/client";
import { CreateRefundDto } from "./dto/create-refund.dto";
import { PAYMENT_GATEWAY_TOKEN, PaymentGateway } from "../payments/gateways/payment-gateway.interface";

@Injectable()
export class RefundsService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(PAYMENT_GATEWAY_TOKEN) private readonly paymentGateway: PaymentGateway
  ) {}

  async createRefund(userId: string, dto: CreateRefundDto) {
    if (!dto.reason || dto.reason.trim() === "") {
      throw new BadRequestException("Reason is required");
    }

    const booking = await this.prisma.booking.findFirst({
      where: { id: dto.bookingId, hostUserId: userId },
      include: { payment: true, refunds: true },
    });

    if (!booking) {
      throw new NotFoundException("Booking not found");
    }

    if (!booking.payment) {
      throw new BadRequestException("Booking has no payment");
    }

    if (booking.payment.status !== PaymentStatus.PAID) {
      throw new BadRequestException("Payment is not PAID");
    }

    if (booking.refunds && booking.refunds.length > 0) {
      throw new BadRequestException("A refund request already exists for this payment");
    }

    try {
      return await this.prisma.refund.create({
        data: {
          bookingId: booking.id,
          paymentId: booking.payment.id,
          amount: booking.payment.amount,
          reason: dto.reason,
          status: RefundStatus.PENDING,
          events: {
            create: {
              toStatus: RefundStatus.PENDING,
              actorUserId: userId,
            },
          },
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        throw new ConflictException("A refund request already exists for this payment");
      }
      throw error;
    }
  }

  async findMyRefunds(userId: string) {
    return this.prisma.refund.findMany({
      where: { booking: { hostUserId: userId } },
      orderBy: { createdAt: "desc" },
    });
  }

  async findRefundById(id: string, userId: string, isSuperAdmin: boolean) {
    const refund = await this.prisma.refund.findUnique({
      where: { id },
      include: { booking: true },
    });

    if (!refund) {
      throw new NotFoundException("Refund not found");
    }

    if (!isSuperAdmin && refund.booking.hostUserId !== userId) {
      throw new NotFoundException("Refund not found");
    }

    return refund;
  }

  async findAllRefunds(status?: RefundStatus) {
    return this.prisma.refund.findMany({
      where: status ? { status } : undefined,
      orderBy: { createdAt: "desc" },
    });
  }

  async findRefundHistory(id: string, userId: string, isSuperAdmin: boolean) {
    await this.findRefundById(id, userId, isSuperAdmin);
    return this.prisma.refundEvent.findMany({
      where: { refundId: id },
      orderBy: { createdAt: "asc" },
    });
  }

  async approveRefund(id: string, adminUserId: string, adminNotes?: string) {
    const refund = await this.prisma.refund.findUnique({ where: { id } });
    if (!refund) throw new NotFoundException("Refund not found");
    
    if (refund.status !== RefundStatus.PENDING) {
      throw new BadRequestException(`Cannot approve refund in status ${refund.status}`);
    }

    return this.prisma.refund.update({
      where: { id },
      data: {
        status: RefundStatus.APPROVED,
        adminNotes: adminNotes ?? refund.adminNotes,
        events: {
          create: {
            fromStatus: refund.status,
            toStatus: RefundStatus.APPROVED,
            actorUserId: adminUserId,
            notes: adminNotes,
          },
        },
      },
    });
  }

  async rejectRefund(id: string, adminUserId: string, adminNotes: string) {
    if (!adminNotes || adminNotes.trim() === "") {
      throw new BadRequestException("adminNotes is required to reject a refund");
    }

    const refund = await this.prisma.refund.findUnique({ where: { id } });
    if (!refund) throw new NotFoundException("Refund not found");

    if (refund.status !== RefundStatus.PENDING) {
      throw new BadRequestException(`Cannot reject refund in status ${refund.status}`);
    }

    return this.prisma.refund.update({
      where: { id },
      data: {
        status: RefundStatus.REJECTED,
        adminNotes,
        events: {
          create: {
            fromStatus: refund.status,
            toStatus: RefundStatus.REJECTED,
            actorUserId: adminUserId,
            notes: adminNotes,
          },
        },
      },
    });
  }

  async processRefund(id: string, adminUserId: string) {
    const refund = await this.prisma.refund.findUnique({ 
      where: { id },
      include: { booking: true, payment: true } 
    });
    if (!refund) throw new NotFoundException("Refund not found");

    if (refund.status !== RefundStatus.APPROVED) {
      throw new BadRequestException(`Cannot process refund in status ${refund.status}`);
    }

    if (refund.payment && refund.payment.provider === "midtrans") {
      await this.paymentGateway.refundPayment(refund.payment.id, refund.amount, refund.id);
    }

    await this.prisma.$transaction(async (tx) => {
      const updateResult = await tx.refund.updateMany({
        where: { id, status: RefundStatus.APPROVED },
        data: {
          status: RefundStatus.PROCESSED,
          processedAt: new Date(),
        },
      });

      if (updateResult.count === 0) {
        throw new BadRequestException("Refund already processed or status changed");
      }

      await tx.refundEvent.create({
        data: {
          refundId: id,
          fromStatus: RefundStatus.APPROVED,
          toStatus: RefundStatus.PROCESSED,
          actorUserId: adminUserId,
        },
      });

      if (refund.paymentId) {
        await tx.payment.update({
          where: { id: refund.paymentId },
          data: { status: PaymentStatus.REFUNDED },
        });
      }

      if (refund.booking.status === BookingStatus.CONFIRMED) {
        await tx.booking.update({
          where: { id: refund.bookingId },
          data: {
            status: BookingStatus.CANCELLED,
            cancelledAt: new Date(),
          },
        });
      }
    });

    return this.prisma.refund.findUniqueOrThrow({ where: { id } });
  }
}
