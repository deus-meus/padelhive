import { PrismaService, prisma as defaultPrisma } from "../../common/prisma";
import { BookingStatus, PaymentStatus, NotificationType, RefundType, RefundStatus, UserRole } from "@prisma/client";
import { BookingSplitService, bookingSplitService as defaultSplitService } from "./split.service";
import { NotificationsService, notificationsService as defaultNotifications, CreateNotificationInput } from "../notifications/service";
import { RESCHEDULE_CHARGE_TTL_MS } from "../../common/constants";

export class BookingExpiryService {
  constructor(
    private readonly prisma: PrismaService = defaultPrisma,
    private readonly bookingSplitService: BookingSplitService = defaultSplitService,
    private readonly notifications: NotificationsService = defaultNotifications
  ) {}

  private async safeNotify(input: CreateNotificationInput) {
    try {
      await this.notifications.createNotification(input);
    } catch (err) {
      console.warn(`[BookingExpiryService] Failed to emit notification: ${String(err)}`);
    }
  }

  public async sweepUnpaidRescheduleCharges(): Promise<void> {
    const now = new Date();
    const deadline = new Date(now.getTime() - RESCHEDULE_CHARGE_TTL_MS);

    const overdue = await this.prisma.bookingCharge.findMany({
      where: {
        status: PaymentStatus.PENDING,
        booking: { status: BookingStatus.CONFIRMED },
        OR: [
          { createdAt: { lte: deadline } },
          { booking: { startsAt: { lte: now } } },
        ],
      },
      select: {
        id: true,
        bookingId: true,
        booking: {
          select: {
            id: true,
            hostUserId: true,
            payment: { select: { id: true, amount: true, status: true } },
          },
        },
      },
    });

    if (overdue.length === 0) return;

    let superAdminIds: string[] = [];
    try {
      const admins = await this.prisma.user.findMany({
        where: { role: UserRole.SUPER_ADMIN },
        select: { id: true },
      });
      superAdminIds = admins.map((a) => a.id);
    } catch (err) {
      console.warn(`[BookingExpiryService] Failed to load super admins during reschedule-charge sweep: ${String(err)}`);
    }

    let cancelledCount = 0;

    for (const charge of overdue) {
      try {
        const booking = charge.booking;
        const payment = booking.payment;

        const result = await this.prisma.$transaction(async (tx) => {
          const chargeRes = await tx.bookingCharge.updateMany({
            where: { id: charge.id, status: PaymentStatus.PENDING },
            data: { status: PaymentStatus.FAILED, failedAt: now },
          });
          if (chargeRes.count === 0) return { cancelled: false, refundCreated: false };

          await tx.booking.updateMany({
            where: { id: booking.id, status: BookingStatus.CONFIRMED },
            data: { status: BookingStatus.CANCELLED, cancelledAt: now },
          });

          let refundCreated = false;
          if (payment && payment.status === PaymentStatus.PAID) {
            const existing = await tx.refund.findFirst({ where: { paymentId: payment.id } });
            if (!existing) {
              await tx.refund.create({
                data: {
                  bookingId: booking.id,
                  paymentId: payment.id,
                  amount: payment.amount,
                  reason: "Auto-cancelled: reschedule balance not paid in time.",
                  type: RefundType.FULL,
                  status: RefundStatus.PENDING,
                },
              });
              refundCreated = true;
            }
          }

          return { cancelled: true, refundCreated };
        });

        if (!result.cancelled) continue;
        cancelledCount++;

        try {
          await this.bookingSplitService.refundPaidShares(booking.id, { notifyHostUserId: booking.hostUserId });
        } catch (err) {
          console.warn(`[BookingExpiryService] Best-effort split share refund failed during reschedule-charge sweep for booking ${booking.id}: ${String(err)}`);
        }

        await this.safeNotify({
          userId: booking.hostUserId,
          type: NotificationType.BOOKING_CANCELLED,
          title: "Booking cancelled",
          body: "Your booking was cancelled because the reschedule balance was not paid in time. Any payment will be refunded.",
          linkUrl: `/bookings/${booking.id}`,
        });

        if (result.refundCreated) {
          await Promise.all(
            superAdminIds
              .filter((id) => id !== booking.hostUserId)
              .map((id) =>
                this.safeNotify({
                  userId: id,
                  type: NotificationType.REFUND_REQUESTED,
                  title: "Refund to review",
                  body: "A booking was auto-cancelled for an unpaid reschedule balance and needs a refund.",
                  linkUrl: `/admin/refunds`,
                })
              )
          );
        }
      } catch (err) {
        console.warn(`[BookingExpiryService] Best-effort auto-void failed for charge ${charge.id}: ${String(err)}`);
      }
    }

    if (cancelledCount > 0) {
      console.log(`[BookingExpiryService] Auto-cancelled ${cancelledCount} bookings with unpaid reschedule balance.`);
    }
  }

  public async sweepExpiredBookings(): Promise<void> {
    const now = new Date();

    const expiredBookings = await this.prisma.booking.findMany({
      where: {
        status: BookingStatus.PENDING_PAYMENT,
        expiresAt: { lte: now },
      },
      select: { id: true, voucherId: true },
    });

    if (expiredBookings.length === 0) {
      return;
    }

    const bookingIds = expiredBookings.map((b) => b.id);

    const voucherDecrements = new Map<string, number>();
    for (const b of expiredBookings) {
      if (b.voucherId) {
        voucherDecrements.set(b.voucherId, (voucherDecrements.get(b.voucherId) ?? 0) + 1);
      }
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.booking.updateMany({
        where: {
          id: { in: bookingIds },
          status: BookingStatus.PENDING_PAYMENT,
          expiresAt: { lte: now },
        },
        data: { status: BookingStatus.EXPIRED },
      });

      await tx.payment.updateMany({
        where: {
          bookingId: { in: bookingIds },
          status: PaymentStatus.PENDING,
        },
        data: {
          status: PaymentStatus.FAILED,
          failedAt: now,
        },
      });

      for (const [voucherId, count] of voucherDecrements) {
        await tx.voucher.updateMany({
          where: { id: voucherId, usedCount: { gte: count } },
          data: { usedCount: { decrement: count } },
        });
      }
    });

    const paidShareBookings = await this.prisma.bookingSplitShare.findMany({
      where: { bookingId: { in: bookingIds }, status: "PAID" },
      select: { bookingId: true, booking: { select: { hostUserId: true } } },
      distinct: ["bookingId"],
    });

    for (const b of paidShareBookings) {
      try {
        await this.bookingSplitService.refundPaidShares(b.bookingId, { notifyHostUserId: b.booking.hostUserId });
      } catch (err) {
        console.warn(`[BookingExpiryService] Best-effort split share refund failed during expiry sweep for booking ${b.bookingId}: ${String(err)}`);
      }
    }

    console.log(`[BookingExpiryService] Expired ${bookingIds.length} stale pending-payment bookings.`);
  }

  public async sweepCompletedBookings(): Promise<void> {
    const now = new Date();

    const { count } = await this.prisma.booking.updateMany({
      where: {
        status: BookingStatus.CONFIRMED,
        endsAt: { lte: now },
      },
      data: {
        status: BookingStatus.COMPLETED,
        completedAt: now,
      },
    });

    if (count > 0) {
      console.log(`[BookingExpiryService] Auto-completed ${count} finished bookings.`);
    }
  }
}

export const bookingExpiryService = new BookingExpiryService();
