import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { PrismaService } from "../prisma/prisma.service";
import { BookingStatus, PaymentStatus } from "@prisma/client";
import { BookingSplitService } from "./booking-split.service";

@Injectable()
export class BookingExpiryService {
  private readonly logger = new Logger(BookingExpiryService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly bookingSplitService: BookingSplitService
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
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
        this.logger.warn(`Best-effort split share refund failed during expiry sweep for booking ${b.bookingId}: ${String(err)}`);
      }
    }

    this.logger.log(`Expired ${bookingIds.length} stale pending-payment bookings.`);
  }

  @Cron(CronExpression.EVERY_MINUTE)
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
      this.logger.log(`Auto-completed ${count} finished bookings.`);
    }
  }
}
