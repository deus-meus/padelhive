import { PrismaService, prisma as defaultPrisma } from "../../common/prisma";
import { BookingStatus, PaymentStatus, RefundStatus, Prisma, NotificationType, UserRole, RefundType } from "@prisma/client";
import { CreateRefundInput } from "./model";
import { PaymentGateway, midtransGateway as defaultGateway } from "../payments/midtrans.gateway";
import { NotificationsService, notificationsService as defaultNotifications, CreateNotificationInput } from "../notifications/service";
import { BadRequestException, ConflictException, NotFoundException } from "../../common/errors";

export class RefundsService {
  constructor(
    private readonly prisma: PrismaService = defaultPrisma,
    private readonly paymentGateway: PaymentGateway = defaultGateway,
    private readonly notifications: NotificationsService = defaultNotifications
  ) {}

  private async safeNotify(input: CreateNotificationInput) {
    try {
      await this.notifications.createNotification(input);
    } catch (err) {
      console.warn(`[RefundsService] Failed to emit notification: ${String(err)}`);
    }
  }

  async createRefund(userId: string, dto: CreateRefundInput) {
    if (!dto.reason || dto.reason.trim() === "") {
      throw new BadRequestException("Reason is required");
    }

    const booking = await this.prisma.booking.findFirst({
      where: { id: dto.bookingId, hostUserId: userId },
      include: { payment: true, refunds: true, venue: { include: { admins: true } } },
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
      const refund = await this.prisma.refund.create({
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

      await this.safeNotify({
        userId: userId,
        type: NotificationType.REFUND_REQUESTED,
        title: "Refund requested",
        body: "We received your refund request and it's under review.",
        linkUrl: `/bookings?tab=refunds`,
      });

      const superAdmins = await this.prisma.user.findMany({
        where: { role: UserRole.SUPER_ADMIN },
        select: { id: true },
      });
      const superAdminIds = new Set(superAdmins.map((a) => a.id));
      await Promise.all(
        superAdmins
          .filter((a) => a.id !== userId)
          .map((a) =>
            this.safeNotify({
              userId: a.id,
              type: NotificationType.REFUND_REQUESTED,
              title: "New refund request",
              body: "A refund request is awaiting review.",
              linkUrl: `/admin/refunds`,
            })
          )
      );

      const venueTeamIds = new Set([
        booking.venue.ownerId,
        ...booking.venue.admins.map((admin) => admin.userId),
      ]);

      await Promise.all(
        Array.from(venueTeamIds)
          .filter((id) => id !== userId && !superAdminIds.has(id))
          .map((id) =>
            this.safeNotify({
              userId: id,
              type: NotificationType.REFUND_REQUESTED,
              title: "New refund request",
              body: `A new refund request for ${booking.venue.name} needs review.`,
              linkUrl: `/dashboard/refunds`,
            })
          )
      );

      return refund;
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
      include: {
        booking: {
          include: {
            venue: { select: { id: true, name: true } },
            court: { select: { id: true, name: true, type: true } },
            host: { select: { id: true, name: true, email: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async findRefundById(id: string, userId: string, isSuperAdmin: boolean) {
    const refund = await this.prisma.refund.findUnique({
      where: { id },
      include: {
        booking: {
          include: { venue: { include: { admins: { where: { userId } } } } },
        },
      },
    });

    if (!refund) {
      throw new NotFoundException("Refund not found");
    }

    if (!isSuperAdmin && refund.booking.hostUserId !== userId) {
      const venue = refund.booking.venue;
      if (venue.ownerId !== userId && venue.admins.length === 0) {
        throw new NotFoundException("Refund not found");
      }
    }

    return refund;
  }

  async findAllRefunds(userId: string, isSuperAdmin: boolean, status?: RefundStatus) {
    return this.prisma.refund.findMany({
      where: {
        ...(status ? { status } : {}),
        ...(isSuperAdmin
          ? {}
          : {
              booking: { venue: { OR: [{ ownerId: userId }, { admins: { some: { userId } } }] } },
            }),
      },
      include: {
        booking: {
          include: {
            venue: { select: { id: true, name: true } },
            court: { select: { id: true, name: true, type: true } },
            host: { select: { id: true, name: true, email: true } },
          },
        },
      },
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

  async approveRefund(id: string, adminUserId: string, isSuperAdmin: boolean, adminNotes?: string) {
    const refund = await this.prisma.refund.findUnique({
      where: { id },
      include: {
        booking: {
          include: { venue: { include: { admins: { where: { userId: adminUserId } } } } },
        },
      },
    });
    if (!refund) throw new NotFoundException("Refund not found");

    if (!isSuperAdmin) {
      const venue = refund.booking.venue;
      if (venue.ownerId !== adminUserId && venue.admins.length === 0) {
        throw new NotFoundException("Refund not found");
      }
    }

    if (refund.status !== RefundStatus.PENDING) {
      throw new BadRequestException(`Cannot approve refund in status ${refund.status}`);
    }

    const updatedRefund = await this.prisma.refund.update({
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

    await this.safeNotify({
      userId: refund.booking.hostUserId,
      type: NotificationType.REFUND_APPROVED,
      title: "Refund approved",
      body: "Your refund was approved and will be processed shortly.",
      linkUrl: `/bookings?tab=refunds`,
    });

    return updatedRefund;
  }

  async rejectRefund(id: string, adminUserId: string, isSuperAdmin: boolean, adminNotes: string) {
    if (!adminNotes || adminNotes.trim() === "") {
      throw new BadRequestException("adminNotes is required to reject a refund");
    }

    const refund = await this.prisma.refund.findUnique({
      where: { id },
      include: {
        booking: {
          include: { venue: { include: { admins: { where: { userId: adminUserId } } } } },
        },
      },
    });
    if (!refund) throw new NotFoundException("Refund not found");

    if (!isSuperAdmin) {
      const venue = refund.booking.venue;
      if (venue.ownerId !== adminUserId && venue.admins.length === 0) {
        throw new NotFoundException("Refund not found");
      }
    }

    if (refund.status !== RefundStatus.PENDING) {
      throw new BadRequestException(`Cannot reject refund in status ${refund.status}`);
    }

    const updatedRefund = await this.prisma.refund.update({
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

    await this.safeNotify({
      userId: refund.booking.hostUserId,
      type: NotificationType.REFUND_REJECTED,
      title: "Refund rejected",
      body: "Your refund request was rejected.",
      linkUrl: `/bookings?tab=refunds`,
    });

    return updatedRefund;
  }

  async processRefund(id: string, adminUserId: string, isSuperAdmin: boolean) {
    const refund = await this.prisma.refund.findUnique({
      where: { id },
      include: {
        booking: { include: { venue: { include: { admins: { where: { userId: adminUserId } } } }, payment: true } },
        payment: true,
      },
    });
    if (!refund) throw new NotFoundException("Refund not found");

    if (!isSuperAdmin) {
      const venue = refund.booking.venue;
      if (venue.ownerId !== adminUserId && venue.admins.length === 0) {
        throw new NotFoundException("Refund not found");
      }
    }

    if (refund.status !== RefundStatus.APPROVED) {
      throw new BadRequestException(`Cannot process refund in status ${refund.status}`);
    }

    const gatewayPayment = refund.payment ?? refund.booking.payment;
    if (gatewayPayment && gatewayPayment.provider === "midtrans") {
      await this.paymentGateway.refundPayment(gatewayPayment.id, refund.amount, refund.id);
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

      if (refund.booking.status === BookingStatus.CONFIRMED && refund.type !== RefundType.RESCHEDULE_DIFF) {
        await tx.booking.update({
          where: { id: refund.bookingId },
          data: {
            status: BookingStatus.CANCELLED,
            cancelledAt: new Date(),
          },
        });
      }
    });

    await this.safeNotify({
      userId: refund.booking.hostUserId,
      type: NotificationType.REFUND_PROCESSED,
      title: "Refund processed",
      body: "Your refund has been processed.",
      linkUrl: `/bookings?tab=refunds`,
    });

    return this.prisma.refund.findUniqueOrThrow({ where: { id } });
  }
}

export const refundsService = new RefundsService();
