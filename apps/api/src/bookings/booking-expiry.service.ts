import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { PrismaService } from "../prisma/prisma.service";
import { BookingStatus, PaymentStatus } from "@prisma/client";

@Injectable()
export class BookingExpiryService {
  private readonly logger = new Logger(BookingExpiryService.name);

  constructor(private readonly prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_MINUTE)
  public async sweepExpiredBookings(): Promise<void> {
    const now = new Date();

    const expiredBookings = await this.prisma.booking.findMany({
      where: {
        status: BookingStatus.PENDING_PAYMENT,
        expiresAt: { lte: now },
      },
      select: { id: true },
    });

    if (expiredBookings.length === 0) {
      return;
    }

    const bookingIds = expiredBookings.map((b) => b.id);

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
    });

    this.logger.log(`Expired ${bookingIds.length} stale pending-payment bookings.`);
  }
}
