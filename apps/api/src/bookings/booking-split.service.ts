import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { BookingStatus, SplitShareStatus } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { SetBookingSplitDto } from "./dto/create-split.dto";
import { BookingSplitDto, BookingSplitShareDto } from "./dto/split-response.dto";

@Injectable()
export class BookingSplitService {
  constructor(private readonly prisma: PrismaService) {}

  private identityKey(s: { inviteId: string | null; userId: string | null; email: string | null; name: string }): string {
    if (s.inviteId) return `invite:${s.inviteId}`;
    if (s.userId) return `user:${s.userId}`;
    if (s.email) return `email:${s.email.toLowerCase()}`;
    return `name:${s.name.trim().toLowerCase()}`;
  }

  private async getValidBooking(bookingId: string, userId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      select: { id: true, hostUserId: true, finalAmount: true, status: true },
    });

    if (!booking) {
      throw new NotFoundException("Booking not found");
    }

    if (booking.hostUserId !== userId) {
      throw new ForbiddenException("Only the booking host can manage the split ledger");
    }

    if (booking.status === BookingStatus.CANCELLED || booking.status === BookingStatus.EXPIRED) {
      throw new BadRequestException("Cannot manage split ledger for cancelled or expired bookings");
    }

    return booking;
  }

  private buildSplitResponse(bookingId: string, finalAmount: number, shares: Array<{ id: string; name: string; email: string | null; userId: string | null; inviteId: string | null; amount: number; status: "PENDING" | "PAID"; paidAt: Date | null; }>): BookingSplitDto {
    let splitTotal = 0;
    let paidAmount = 0;

    const mappedShares: BookingSplitShareDto[] = shares.map((share) => {
      splitTotal += share.amount;
      if (share.status === SplitShareStatus.PAID) {
        paidAmount += share.amount;
      }
      return {
        id: share.id,
        name: share.name,
        email: share.email,
        userId: share.userId,
        inviteId: share.inviteId,
        amount: share.amount,
        status: share.status,
        paidAt: share.paidAt,
      };
    });

    return {
      bookingId,
      totalAmount: finalAmount,
      splitTotal,
      paidAmount,
      shareCount: shares.length,
      shares: mappedShares,
    };
  }

  async getSplit(bookingId: string, userId: string): Promise<BookingSplitDto> {
    const booking = await this.getValidBooking(bookingId, userId);

    const shares = await this.prisma.bookingSplitShare.findMany({
      where: { bookingId },
      orderBy: { createdAt: "asc" },
    });

    return this.buildSplitResponse(bookingId, booking.finalAmount, shares);
  }

  async setSplit(bookingId: string, userId: string, dto: SetBookingSplitDto): Promise<BookingSplitDto> {
    const booking = await this.getValidBooking(bookingId, userId);

    if (!dto.participants || dto.participants.length === 0) {
      throw new BadRequestException("Participants list cannot be empty");
    }

    const n = dto.participants.length;
    for (const p of dto.participants) {
      if (!p.name || typeof p.name !== "string" || p.name.trim() === "") {
        throw new BadRequestException("Each participant must have a non-empty name");
      }
    }

    const processedParticipants: any[] = [];

    if (dto.mode === "equal") {
      const baseAmount = Math.floor(booking.finalAmount / n);
      const remainder = booking.finalAmount - baseAmount * n;

      for (let i = 0; i < n; i++) {
        const p = dto.participants[i];
        processedParticipants.push({
          bookingId,
          name: p.name.trim(),
          email: p.email || null,
          userId: p.userId || null,
          inviteId: p.inviteId || null,
          amount: i === 0 ? baseAmount + remainder : baseAmount,
          status: SplitShareStatus.PENDING,
          paidAt: null,
        });
      }
    } else if (dto.mode === "custom") {
      let sum = 0;
      for (const p of dto.participants) {
        if (p.amount === undefined || p.amount === null || typeof p.amount !== "number" || p.amount < 0 || !Number.isInteger(p.amount)) {
          throw new BadRequestException("Each participant must have a valid non-negative integer amount in custom mode");
        }
        sum += p.amount;
        processedParticipants.push({
          bookingId,
          name: p.name.trim(),
          email: p.email || null,
          userId: p.userId || null,
          inviteId: p.inviteId || null,
          amount: p.amount,
          status: SplitShareStatus.PENDING,
          paidAt: null,
        });
      }

      if (sum !== booking.finalAmount) {
        throw new BadRequestException(`The sum of custom amounts (${sum}) must exactly equal the booking final amount (${booking.finalAmount})`);
      }
    } else {
      throw new BadRequestException("Invalid split mode");
    }

    const shares = await this.prisma.$transaction(async (tx) => {
      const existing = await tx.bookingSplitShare.findMany({
        where: { bookingId },
      });

      const statusByIdentity = new Map<string, { status: SplitShareStatus; paidAt: Date | null }>();
      for (const s of existing) {
        const key = this.identityKey(s);
        if (!statusByIdentity.has(key)) {
          statusByIdentity.set(key, { status: s.status, paidAt: s.paidAt });
        }
      }

      const enriched = processedParticipants.map((p) => {
        const key = this.identityKey(p);
        const prior = statusByIdentity.get(key);
        if (prior) {
          statusByIdentity.delete(key);
          return { ...p, status: prior.status, paidAt: prior.paidAt };
        }
        return p;
      });

      await tx.bookingSplitShare.deleteMany({
        where: { bookingId },
      });

      await tx.bookingSplitShare.createMany({
        data: enriched,
      });

      return tx.bookingSplitShare.findMany({
        where: { bookingId },
        orderBy: { createdAt: "asc" },
      });
    });

    return this.buildSplitResponse(bookingId, booking.finalAmount, shares);
  }

  async clearSplit(bookingId: string, userId: string): Promise<void> {
    await this.getValidBooking(bookingId, userId);

    await this.prisma.bookingSplitShare.deleteMany({
      where: { bookingId },
    });
  }

  async setShareStatus(bookingId: string, shareId: string, userId: string, status: "PENDING" | "PAID"): Promise<BookingSplitDto> {
    const booking = await this.getValidBooking(bookingId, userId);

    if (status !== "PENDING" && status !== "PAID") {
      throw new BadRequestException("Status must be PENDING or PAID");
    }

    const share = await this.prisma.bookingSplitShare.findFirst({
      where: { id: shareId, bookingId },
    });

    if (!share) {
      throw new NotFoundException("Split share not found for this booking");
    }

    await this.prisma.bookingSplitShare.update({
      where: { id: shareId },
      data: {
        status: status as SplitShareStatus,
        paidAt: status === "PAID" ? new Date() : null,
      },
    });

    const shares = await this.prisma.bookingSplitShare.findMany({
      where: { bookingId },
      orderBy: { createdAt: "asc" },
    });

    return this.buildSplitResponse(bookingId, booking.finalAmount, shares);
  }
}
