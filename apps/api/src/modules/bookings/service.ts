import {
  BookingStatus,
  type CourtType,
  NotificationType,
  PaymentStatus,
  type Prisma,
  RefundStatus,
  RefundType,
  UserRole,
  VenueStatus,
} from "@prisma/client";
import {
  INSURANCE_REFUND_ELIGIBLE_REASON,
  INSURANCE_REFUND_INELIGIBLE_REASON,
  INSURANCE_REFUND_WINDOW_MS,
  PENDING_PAYMENT_TTL_MS,
  REFUND_ELIGIBLE_REASON,
  REFUND_ELIGIBLE_UNPAID_REASON,
  REFUND_INELIGIBLE_REASON,
  REFUND_WINDOW_MS,
} from "../../common/constants";
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from "../../common/errors";
import {
  getSlotPrice,
  isOvernight,
  isWeekendWib,
  parseHour,
  resolveSlotUtc,
  utcToWibDateStr,
  wibHourFromUtc,
} from "../../common/pricing.util";
import {
  prisma as defaultPrisma,
  type PrismaService,
} from "../../common/prisma";
import {
  type CreateNotificationInput,
  notificationsService as defaultNotifications,
  type NotificationsService,
} from "../notifications/service";
import {
  vouchersService as defaultVouchers,
  type VouchersService,
} from "../vouchers/service";
import type { CreateBookingInput, RescheduleBookingInput } from "./model";
import {
  type BookingSplitService,
  bookingSplitService as defaultSplitService,
} from "./split.service";

type BookingFilter = "upcoming" | "past" | "cancelled";

const PLATFORM_FEE_RATE = 0.05;
const TIME_PATTERN = /^([01]\d|2[0-3]):00$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const bookingSelect = {
  id: true,
  bookingDate: true,
  startsAt: true,
  endsAt: true,
  durationMinutes: true,
  status: true,
  courtAmount: true,
  platformFee: true,
  voucherDiscount: true,
  finalAmount: true,
  venue: { select: { id: true, name: true, city: true } },
  court: { select: { id: true, name: true, type: true } },
  host: { select: { id: true, name: true, email: true } },
};

const cancellableBookingSelect = {
  ...bookingSelect,
  voucherId: true,
  cancelledAt: true,
  payment: {
    select: {
      id: true,
      amount: true,
      status: true,
    },
  },
  charges: {
    select: {
      id: true,
      amount: true,
      reason: true,
      status: true,
    },
  },
};

const reschedulableBookingSelect = {
  id: true,
  status: true,
  voucherId: true,
  voucherDiscount: true,
  finalAmount: true,
  payment: { select: { id: true, status: true, provider: true, method: true } },
  courtId: true,
  venueId: true,
  venue: {
    select: { openTime: true, closeTime: true, weeklyHours: true },
  },
  court: {
    select: {
      id: true,
      type: true,
      weekdayPeak: true,
      weekdayOffPeak: true,
      weekendPeak: true,
      weekendOffPeak: true,
    },
  },
};

type CancellableBooking = {
  id: string;
  bookingDate: Date;
  startsAt: Date;
  endsAt: Date;
  durationMinutes: number;
  status: BookingStatus;
  courtAmount: number;
  platformFee: number;
  voucherDiscount: number;
  finalAmount: number;
  voucherId: string | null;
  cancelledAt: Date | null;
  venue: { id: string; name: string; city: string };
  court: { id: string; name: string; type: CourtType };
  host: { id: string; name: string | null; email: string };
  payment: { id: string; amount: number; status: PaymentStatus } | null;
  charges: {
    id: string;
    amount: number;
    reason: string;
    status: PaymentStatus;
  }[];
};

type RefundDecision = {
  isRefundEligible: boolean;
  refundAmount: number;
  refundPolicyReason: string;
};

type SelectedCourt = {
  id?: string;
  venueId?: string;
  name?: string;
  type?: CourtType;
  isActive?: boolean;
  weekdayPeak: number;
  weekdayOffPeak: number;
  weekendPeak: number;
  weekendOffPeak: number;
};

type ParsedBookingTime = {
  bookingDate: Date;
  startsAt: Date;
  endsAt: Date;
  durationMinutes: number;
};

export class BookingsService {
  constructor(
    private readonly prisma: PrismaService = defaultPrisma,
    private readonly vouchersService: VouchersService = defaultVouchers,
    private readonly notifications: NotificationsService = defaultNotifications,
    private readonly bookingSplitService: BookingSplitService = defaultSplitService,
  ) {}

  private async safeNotify(input: CreateNotificationInput) {
    try {
      await this.notifications.createNotification(input);
    } catch (err) {
      console.warn(
        `[BookingsService] Failed to emit notification: ${String(err)}`,
      );
    }
  }

  async createBookingForUser(hostUserId: string, body: CreateBookingInput) {
    const venue = await this.prisma.venue.findFirst({
      where: { id: body.venueId, status: VenueStatus.APPROVED },
      select: {
        id: true,
        name: true,
        city: true,
        status: true,
        openTime: true,
        closeTime: true,
        weeklyHours: true,
      },
    });

    if (!venue) {
      throw new NotFoundException("Venue not found");
    }

    const { openHour, closeHour } = this.resolveDayHours(
      venue,
      body.bookingDate,
    );
    const parsedTime = this.parseBookingTime(
      body.bookingDate,
      body.startsAt,
      body.endsAt,
      openHour,
      closeHour,
    );

    const court = await this.prisma.court.findFirst({
      where: { id: body.courtId, venueId: body.venueId, isActive: true },
      select: {
        id: true,
        venueId: true,
        name: true,
        type: true,
        isActive: true,
        weekdayPeak: true,
        weekdayOffPeak: true,
        weekendPeak: true,
        weekendOffPeak: true,
      },
    });

    if (!court) {
      throw new NotFoundException("Court not found or not active");
    }

    const isAvailable = await this.isCourtAvailable(
      court.id,
      parsedTime.startsAt,
      parsedTime.endsAt,
    );
    if (!isAvailable) {
      throw new ConflictException("Court is already booked for this time");
    }

    const {
      courtAmount,
      platformFee,
      voucherDiscount,
      finalAmount,
      voucherId,
    } = await this.calculatePricing(
      court,
      parsedTime.startsAt,
      parsedTime.durationMinutes,
      body.voucherCode,
    );

    const insuranceAmount = body.hasInsurance ? 25000 : 0;
    const totalFinalAmount = finalAmount + insuranceAmount;

    const expiresAt = new Date(Date.now() + PENDING_PAYMENT_TTL_MS);

    const booking = await this.prisma.$transaction(async (tx) => {
      const created = await tx.booking.create({
        data: {
          hostUserId,
          venueId: body.venueId,
          courtId: body.courtId,
          voucherId,
          bookingDate: parsedTime.bookingDate,
          startsAt: parsedTime.startsAt,
          endsAt: parsedTime.endsAt,
          durationMinutes: parsedTime.durationMinutes,
          status: BookingStatus.PENDING_PAYMENT,
          courtAmount,
          platformFee,
          voucherDiscount,
          finalAmount: totalFinalAmount,
          expiresAt,
        },
        select: bookingSelect,
      });

      if (voucherId) {
        await tx.voucher.update({
          where: { id: voucherId },
          data: { usedCount: { increment: 1 } },
        });
      }

      await tx.invite.create({
        data: {
          bookingId: created.id,
          userId: hostUserId,
          email: created.host.email,
          name: created.host.name ?? created.host.email.split("@")[0],
          token: `host-${created.id}`,
          status: "ACCEPTED",
          isHost: true,
        },
      });

      if (body.hasInsurance) {
        await tx.bookingCharge.create({
          data: {
            bookingId: created.id,
            amount: 25000,
            reason: "Refund Protection Insurance",
            status: PaymentStatus.PENDING,
            provider: "internal",
            method: "internal",
          },
        });
      }

      return created;
    });

    return booking;
  }

  async rescheduleBookingForUser(
    bookingId: string,
    hostUserId: string,
    body: RescheduleBookingInput,
  ) {
    const booking = await this.prisma.booking.findFirst({
      where: { id: bookingId, hostUserId },
      select: reschedulableBookingSelect,
    });

    if (!booking) {
      throw new NotFoundException("Booking not found");
    }

    if (
      booking.status !== BookingStatus.CONFIRMED &&
      booking.status !== BookingStatus.PENDING_PAYMENT
    ) {
      throw new BadRequestException(
        "Only confirmed or pending-payment bookings can be rescheduled",
      );
    }

    const hasSplitShares =
      (await this.prisma.bookingSplitShare.count({ where: { bookingId } })) > 0;
    if (hasSplitShares) {
      throw new BadRequestException("Split bookings cannot be rescheduled");
    }

    const venue = booking.venue;
    const { openHour, closeHour } = this.resolveDayHours(
      venue,
      body.bookingDate,
    );
    const parsedTime = this.parseBookingTime(
      body.bookingDate,
      body.startsAt,
      body.endsAt,
      openHour,
      closeHour,
    );

    const isAvailable = await this.isCourtAvailable(
      booking.courtId,
      parsedTime.startsAt,
      parsedTime.endsAt,
      bookingId,
    );
    if (!isAvailable) {
      throw new ConflictException("Court is already booked for this time");
    }

    const { courtAmount, platformFee } = this.calculateCourtPricing(
      booking.court,
      parsedTime.startsAt,
      parsedTime.durationMinutes,
    );
    const newSubtotal = courtAmount + platformFee;

    let voucherDiscount = 0;
    if (booking.voucherId) {
      voucherDiscount = await this.vouchersService.repriceVoucherById(
        booking.voucherId,
        newSubtotal,
      );
    }

    const newFinalAmount = Math.max(0, newSubtotal - voucherDiscount);
    const oldFinalAmount = booking.finalAmount;
    const priceDelta = newFinalAmount - oldFinalAmount;

    const createRefundPending =
      priceDelta < 0 &&
      booking.payment &&
      booking.payment.status === PaymentStatus.PAID;
    const refundAmount = createRefundPending ? Math.abs(priceDelta) : 0;
    const createTopUpCharge =
      priceDelta > 0 && booking.status === BookingStatus.CONFIRMED;

    try {
      const updated = await this.prisma.$transaction(async (tx) => {
        const res = await tx.booking.update({
          where: { id: bookingId },
          data: {
            bookingDate: parsedTime.bookingDate,
            startsAt: parsedTime.startsAt,
            endsAt: parsedTime.endsAt,
            durationMinutes: parsedTime.durationMinutes,
            courtAmount,
            platformFee,
            voucherDiscount,
            finalAmount: newFinalAmount,
          },
          select: bookingSelect,
        });

        await tx.bookingCharge.deleteMany({
          where: { bookingId, status: PaymentStatus.PENDING },
        });

        if (createTopUpCharge) {
          await tx.bookingCharge.create({
            data: {
              bookingId,
              amount: priceDelta,
              reason: "Reschedule difference",
              status: PaymentStatus.PENDING,
              provider: "midtrans",
              method: booking.payment?.method || "va",
            },
          });
        }

        if (createRefundPending && booking.payment) {
          await tx.refund.create({
            data: {
              bookingId,
              paymentId: booking.payment.id,
              amount: refundAmount,
              reason: "Partial refund from reschedule",
              type: RefundType.RESCHEDULE_DIFF,
              status: RefundStatus.PENDING,
              adminNotes: "Auto-generated from reschedule price decrease",
            },
          });
        }

        return res;
      });

      if (createRefundPending) {
        try {
          const venueData = await this.prisma.venue.findUnique({
            where: { id: booking.venueId },
            select: {
              name: true,
              ownerId: true,
              admins: { select: { userId: true } },
            },
          });

          if (venueData) {
            const superAdmins = await this.prisma.user.findMany({
              where: { role: UserRole.SUPER_ADMIN },
              select: { id: true },
            });
            const superAdminIds = new Set(superAdmins.map((a) => a.id));

            await Promise.all(
              superAdmins
                .filter((a) => a.id !== hostUserId)
                .map((a) =>
                  this.safeNotify({
                    userId: a.id,
                    type: NotificationType.REFUND_REQUESTED,
                    title: "New refund request",
                    body: "A partial refund from reschedule is awaiting review.",
                    linkUrl: `/admin/refunds`,
                  }),
                ),
            );

            const venueTeamIds = new Set([
              venueData.ownerId,
              ...venueData.admins.map((admin) => admin.userId),
            ]);

            await Promise.all(
              Array.from(venueTeamIds)
                .filter((id) => id !== hostUserId && !superAdminIds.has(id))
                .map((id) =>
                  this.safeNotify({
                    userId: id,
                    type: NotificationType.REFUND_REQUESTED,
                    title: "New refund request",
                    body: `A partial refund from reschedule for ${venueData.name} needs review.`,
                    linkUrl: `/dashboard/refunds`,
                  }),
                ),
            );
          }
        } catch (err) {
          console.warn(
            `Best-effort reschedule refund notifications failed for booking ${booking.id}: ${String(err)}`,
          );
        }
      }

      if (createTopUpCharge) {
        await this.safeNotify({
          userId: hostUserId,
          type: NotificationType.BALANCE_DUE,
          title: "Balance due",
          body: `A price difference of Rp ${priceDelta.toLocaleString("id-ID")} is due for your reschedule.`,
          linkUrl: `/bookings/${booking.id}`,
        });
      }

      return { ...updated, priceDelta };
    } catch (error) {
      const e = error as {
        message?: string;
        meta?: { message?: string; target?: unknown };
      };
      const msg = e?.message || "";
      const metaMsg = e?.meta?.message || "";
      const target = e?.meta?.target || [];

      if (
        msg.includes("Exclusive overlap constraint violation") ||
        metaMsg.includes("Exclusive overlap constraint violation") ||
        (Array.isArray(target) &&
          target.includes("courtId") &&
          target.includes("startsAt"))
      ) {
        throw new ConflictException(
          "Court is unavailable for the requested time",
        );
      }
      throw error;
    }
  }

  async findBookingsForUser(userId: string, filter: BookingFilter) {
    const now = new Date();
    const where: Prisma.BookingWhereInput = {
      hostUserId: userId,
      status: { not: BookingStatus.EXPIRED },
    };

    if (filter === "cancelled") {
      where.status = BookingStatus.CANCELLED;
    } else if (filter === "past") {
      where.status = BookingStatus.COMPLETED;
    } else {
      where.status = {
        in: [BookingStatus.CONFIRMED, BookingStatus.PENDING_PAYMENT],
      };
      where.endsAt = { gt: now };
    }

    const bookings = await this.prisma.booking.findMany({
      where,
      orderBy: {
        startsAt: filter === "past" || filter === "cancelled" ? "desc" : "asc",
      },
      select: cancellableBookingSelect,
    });

    return bookings.map((booking) => {
      const decision = this.calculateRefundDecision(
        booking as CancellableBooking,
        now,
      );
      return this.withRefundDecision(booking as CancellableBooking, decision);
    });
  }

  async findBookingForUser(id: string, userId: string) {
    const booking = await this.prisma.booking.findFirst({
      where: { id, hostUserId: userId },
      select: cancellableBookingSelect,
    });

    if (!booking) {
      throw new NotFoundException("Booking not found");
    }

    const now = new Date();
    const decision = this.calculateRefundDecision(
      booking as CancellableBooking,
      now,
    );
    const enriched = this.withRefundDecision(
      booking as CancellableBooking,
      decision,
    );

    const pendingCharge = await this.prisma.bookingCharge.findFirst({
      where: { bookingId: id, status: PaymentStatus.PENDING },
      orderBy: { createdAt: "desc" },
    });

    return { ...enriched, balanceDue: pendingCharge?.amount };
  }

  async cancelBookingForUser(id: string, hostUserId: string, now = new Date()) {
    const booking = await this.prisma.booking.findFirst({
      where: { id, hostUserId },
      select: cancellableBookingSelect,
    });

    if (!booking) {
      throw new NotFoundException("Booking not found");
    }

    if (booking.status === BookingStatus.CANCELLED) {
      throw new BadRequestException("Booking is already cancelled");
    }

    if (
      booking.status === BookingStatus.COMPLETED ||
      booking.status === BookingStatus.EXPIRED
    ) {
      throw new BadRequestException(
        "Booking cannot be cancelled in its current status",
      );
    }

    const refundDecision = this.calculateRefundDecision(
      booking as CancellableBooking,
      now,
    );

    const cancelledBooking = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.booking.update({
        where: { id },
        data: {
          status: BookingStatus.CANCELLED,
          cancelledAt: now,
        },
        select: cancellableBookingSelect,
      });

      if (booking.voucherId) {
        await tx.voucher.updateMany({
          where: { id: booking.voucherId, usedCount: { gt: 0 } },
          data: { usedCount: { decrement: 1 } },
        });
      }

      if (
        refundDecision.isRefundEligible &&
        booking.payment &&
        refundDecision.refundAmount > 0
      ) {
        await tx.refund.create({
          data: {
            bookingId: booking.id,
            paymentId: booking.payment.id,
            amount: refundDecision.refundAmount,
            reason: refundDecision.refundPolicyReason,
            status: RefundStatus.PENDING,
          },
        });
      }

      return updated;
    });

    await this.safeNotify({
      userId: hostUserId,
      type: NotificationType.BOOKING_CANCELLED,
      title: "Booking cancelled",
      body: "Your booking has been cancelled.",
      linkUrl: `/bookings/${booking.id}`,
    });

    if (refundDecision.isRefundEligible) {
      try {
        await this.bookingSplitService.refundPaidShares(booking.id, {
          notifyHostUserId: hostUserId,
        });
      } catch (err) {
        console.warn(
          `Best-effort split share refund failed during cancel for booking ${booking.id}: ${String(err)}`,
        );
      }
    }

    return this.withRefundDecision(
      cancelledBooking as CancellableBooking,
      refundDecision,
    );
  }

  private calculateRefundDecision(
    booking: CancellableBooking,
    now: Date,
  ): RefundDecision {
    const hasInsurance = booking.charges?.some(
      (c) =>
        c.reason === "Refund Protection Insurance" &&
        c.status === PaymentStatus.PAID,
    );

    const windowLimit = hasInsurance
      ? INSURANCE_REFUND_WINDOW_MS
      : REFUND_WINDOW_MS;
    const isRefundEligible =
      booking.startsAt.getTime() - now.getTime() >= windowLimit;
    const hasPaidPayment = booking.payment?.status === PaymentStatus.PAID;

    if (isRefundEligible && hasPaidPayment) {
      const reason = hasInsurance
        ? INSURANCE_REFUND_ELIGIBLE_REASON
        : REFUND_ELIGIBLE_REASON;
      return {
        isRefundEligible: true,
        refundAmount: booking.finalAmount,
        refundPolicyReason: reason,
      };
    }

    if (isRefundEligible && !hasPaidPayment) {
      return {
        isRefundEligible: true,
        refundAmount: 0,
        refundPolicyReason: REFUND_ELIGIBLE_UNPAID_REASON,
      };
    }

    const reason = hasInsurance
      ? INSURANCE_REFUND_INELIGIBLE_REASON
      : REFUND_INELIGIBLE_REASON;
    return {
      isRefundEligible: false,
      refundAmount: 0,
      refundPolicyReason: reason,
    };
  }

  private withRefundDecision(
    booking: CancellableBooking,
    refundDecision: RefundDecision,
  ) {
    const { voucherId: _vId, charges: _charges, ...rest } = booking;
    return {
      ...rest,
      isRefundEligible: refundDecision.isRefundEligible,
      refundAmount: refundDecision.refundAmount,
      refundPolicyReason: refundDecision.refundPolicyReason,
    };
  }

  private resolveDayHours(
    venue: {
      openTime: string;
      closeTime: string;
      weeklyHours?: Prisma.JsonValue | null;
    },
    dateStr: string,
  ) {
    const dayIdx = new Date(`${dateStr}T12:00:00Z`).getUTCDay();
    const key = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"][dayIdx];

    let openTime = venue.openTime;
    let closeTime = venue.closeTime;

    if (
      venue.weeklyHours &&
      typeof venue.weeklyHours === "object" &&
      key in venue.weeklyHours
    ) {
      const entry = (
        venue.weeklyHours as Record<
          string,
          { open?: string; close?: string; closed?: boolean }
        >
      )[key];
      if (entry.closed === true) {
        throw new BadRequestException("Venue is closed on this day");
      }
      if (entry.open) openTime = entry.open;
      if (entry.close) closeTime = entry.close;
    }

    return {
      openHour: parseHour(openTime || "06:00"),
      closeHour: parseHour(closeTime || "22:00"),
    };
  }

  private parseBookingTime(
    dateStr: string,
    startsAtStr: string,
    endsAtStr: string,
    openHour: number,
    closeHour: number,
  ): ParsedBookingTime {
    const bookingDate = new Date(`${dateStr}T00:00:00.000Z`);
    if (
      !DATE_PATTERN.test(dateStr) ||
      Number.isNaN(bookingDate.getTime()) ||
      bookingDate.toISOString().slice(0, 10) !== dateStr
    ) {
      throw new BadRequestException("bookingDate must use YYYY-MM-DD format");
    }

    if (!TIME_PATTERN.test(startsAtStr) || !TIME_PATTERN.test(endsAtStr)) {
      throw new BadRequestException(
        "startsAt and endsAt must use whole-hour HH:00 format",
      );
    }

    const startHour = parseInt(startsAtStr.split(":")[0], 10);
    const endHour = parseInt(endsAtStr.split(":")[0], 10);

    const overnight = isOvernight(openHour, closeHour);
    const totalVenueHours = overnight
      ? 24 - openHour + closeHour
      : closeHour - openHour;

    const startOffset = overnight
      ? startHour >= openHour
        ? startHour - openHour
        : 24 - openHour + startHour
      : startHour - openHour;
    const endOffset = overnight
      ? endHour >= openHour
        ? endHour - openHour
        : 24 - openHour + endHour
      : endHour - openHour;

    if (startOffset < 0 || startOffset >= totalVenueHours) {
      throw new BadRequestException(
        "startsAt is outside the venue operating hours",
      );
    }

    if (endOffset <= startOffset || endOffset > totalVenueHours) {
      throw new BadRequestException(
        "endsAt must be after startsAt and within operating hours",
      );
    }

    const durationHours = endOffset - startOffset;
    const durationMinutes = durationHours * 60;

    const startsAt = resolveSlotUtc(dateStr, startHour, openHour, overnight);
    const endsAt = new Date(startsAt.getTime() + durationMinutes * 60000);

    if (startsAt <= new Date()) {
      throw new BadRequestException("startsAt must be in the future");
    }

    return {
      bookingDate,
      startsAt,
      endsAt,
      durationMinutes,
    };
  }

  private async isCourtAvailable(
    courtId: string,
    startsAt: Date,
    endsAt: Date,
    excludeBookingId?: string,
  ): Promise<boolean> {
    const conflictingBooking = await this.prisma.booking.findFirst({
      where: {
        courtId,
        id: excludeBookingId ? { not: excludeBookingId } : undefined,
        status: {
          in: [BookingStatus.PENDING_PAYMENT, BookingStatus.CONFIRMED],
        },
        startsAt: { lt: endsAt },
        endsAt: { gt: startsAt },
      },
      select: { id: true },
    });

    return !conflictingBooking;
  }

  private calculateCourtPricing(
    court: SelectedCourt,
    startsAtUtc: Date,
    durationMinutes: number,
  ) {
    const durationHours = durationMinutes / 60;
    let courtAmount = 0;

    for (let i = 0; i < durationHours; i++) {
      const slotStart = new Date(startsAtUtc.getTime() + i * 3600000);
      const wibHour = wibHourFromUtc(slotStart);
      const wibDate = utcToWibDateStr(slotStart);
      const isWeekend = isWeekendWib(wibDate);
      courtAmount += getSlotPrice(court, wibHour, isWeekend);
    }

    const platformFee = Math.round(courtAmount * PLATFORM_FEE_RATE);
    return { courtAmount, platformFee };
  }

  private async calculatePricing(
    court: SelectedCourt,
    startsAtUtc: Date,
    durationMinutes: number,
    voucherCode?: string,
  ) {
    const { courtAmount, platformFee } = this.calculateCourtPricing(
      court,
      startsAtUtc,
      durationMinutes,
    );
    const subtotal = courtAmount + platformFee;

    let voucherDiscount = 0;
    let voucherId: string | null = null;

    if (voucherCode?.trim()) {
      const cleanCode = voucherCode.trim().toUpperCase();
      const voucherResult = await this.vouchersService.priceVoucher(
        cleanCode,
        subtotal,
      );
      voucherDiscount = voucherResult.discount;
      voucherId = voucherResult.voucherId;
    }

    const finalAmount = Math.max(0, subtotal - voucherDiscount);

    return {
      courtAmount,
      platformFee,
      voucherDiscount,
      finalAmount,
      voucherId,
    };
  }

  async getOwnerDashboard(userId: string, isSuperAdmin: boolean) {
    const venues = await this.prisma.venue.findMany({
      where: isSuperAdmin
        ? {}
        : { OR: [{ ownerId: userId }, { admins: { some: { userId } } }] },
      select: { id: true },
    });

    if (venues.length === 0) {
      return {
        kpis: {
          weeklyRevenue: 0,
          weeklyBookings: 0,
          occupancyRate: 0,
          activeCourts: 0,
          pendingPayments: 0,
        },
        revenueSeries: [],
        courtUtilization: [],
        todaysSchedule: [],
        recentBookings: [],
      };
    }

    const venueIds = venues.map((v) => v.id);
    const todayDate = new Date();
    const todayWibStr = utcToWibDateStr(todayDate);
    const todayUtcDate = new Date(`${todayWibStr}T00:00:00.000Z`);

    const weekStartDate = new Date(
      todayUtcDate.getTime() - 6 * 24 * 60 * 60 * 1000,
    );
    const dateLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const revenueSeriesMap = new Map<
      string,
      { date: string; label: string; value: number }
    >();

    for (let i = 6; i >= 0; i--) {
      const d = new Date(todayUtcDate.getTime() - i * 24 * 60 * 60 * 1000);
      const dSafeStr = d.toISOString().split("T")[0];
      revenueSeriesMap.set(dSafeStr, {
        date: dSafeStr,
        label: dateLabels[d.getUTCDay()],
        value: 0,
      });
    }

    const windowBookings = await this.prisma.booking.findMany({
      where: {
        venueId: { in: venueIds },
        bookingDate: { gte: weekStartDate },
      },
      select: {
        id: true,
        bookingDate: true,
        startsAt: true,
        finalAmount: true,
        status: true,
        courtId: true,
        host: { select: { name: true } },
        court: { select: { name: true } },
        venue: { select: { name: true } },
      },
    });

    let weeklyRevenue = 0;
    let weeklyBookings = 0;
    const courtBookingsMap = new Map<string, number>();

    for (const b of windowBookings) {
      if (
        b.status === BookingStatus.CONFIRMED ||
        b.status === BookingStatus.COMPLETED
      ) {
        weeklyRevenue += b.finalAmount;
        weeklyBookings += 1;
        courtBookingsMap.set(
          b.courtId,
          (courtBookingsMap.get(b.courtId) || 0) + 1,
        );

        const wibDateStr = utcToWibDateStr(b.bookingDate);
        const seriesItem = revenueSeriesMap.get(wibDateStr);
        if (seriesItem) {
          seriesItem.value += b.finalAmount;
        }
      }
    }

    const activeCourts = await this.prisma.court.findMany({
      where: { venueId: { in: venueIds }, isActive: true },
      select: { id: true, name: true },
    });

    const maxSlotsPerWeek = activeCourts.length * 16 * 7;
    const occupancyRate =
      maxSlotsPerWeek > 0
        ? Math.round((weeklyBookings / maxSlotsPerWeek) * 100)
        : 0;

    const courtUtilization = activeCourts.map((c) => {
      const count = courtBookingsMap.get(c.id) || 0;
      const rate = Math.round((count / (16 * 7)) * 100);
      return { courtId: c.id, name: c.name, occupancyRate: rate };
    });

    const pendingPayments = await this.prisma.booking.count({
      where: {
        venueId: { in: venueIds },
        status: BookingStatus.PENDING_PAYMENT,
      },
    });

    const todaysSchedule = windowBookings
      .filter(
        (b) =>
          b.bookingDate.getTime() === todayUtcDate.getTime() &&
          (b.status === BookingStatus.CONFIRMED ||
            b.status === BookingStatus.PENDING_PAYMENT),
      )
      .sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime())
      .map((b) => ({
        bookingId: b.id,
        time: `${String(wibHourFromUtc(b.startsAt)).padStart(2, "0")}:00`,
        court: b.court.name,
        player: b.host?.name ?? "Guest",
        status: b.status,
      }));

    const recentBookingsRaw = await this.prisma.booking.findMany({
      where: { venueId: { in: venueIds } },
      orderBy: { startsAt: "desc" },
      take: 5,
      select: {
        id: true,
        bookingDate: true,
        startsAt: true,
        finalAmount: true,
        status: true,
        venue: { select: { name: true } },
        court: { select: { name: true } },
      },
    });

    const recentBookings = recentBookingsRaw.map((b) => ({
      id: b.id,
      venueName: b.venue.name,
      courtName: b.court.name,
      bookingDate: utcToWibDateStr(b.bookingDate),
      time: `${String(wibHourFromUtc(b.startsAt)).padStart(2, "0")}:00`,
      finalAmount: b.finalAmount,
      status: b.status,
    }));

    return {
      kpis: {
        weeklyRevenue,
        weeklyBookings,
        occupancyRate,
        activeCourts: activeCourts.length,
        pendingPayments,
      },
      revenueSeries: Array.from(revenueSeriesMap.values()),
      courtUtilization,
      todaysSchedule,
      recentBookings,
    };
  }

  async getRevenue(userId: string, isSuperAdmin: boolean) {
    const venues = await this.prisma.venue.findMany({
      where: isSuperAdmin
        ? {}
        : {
            OR: [{ ownerId: userId }, { admins: { some: { userId } } }],
          },
      select: { id: true },
    });

    if (venues.length === 0) {
      const emptyMonthly = [];
      const shortMonths = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      const dateLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const todayDate = new Date();
      const todayWibStr = utcToWibDateStr(todayDate);
      const [, monthStr] = todayWibStr.split("-");
      const month = parseInt(monthStr, 10);

      for (let i = 11; i >= 0; i--) {
        let m = month - i;
        if (m < 1) m += 12;
        emptyMonthly.push({ month: shortMonths[m - 1], value: 0 });
      }

      const emptyWeekly = [];
      const todayUtcDate = new Date(`${todayWibStr}T00:00:00.000Z`);
      for (let i = 6; i >= 0; i--) {
        const d = new Date(todayUtcDate.getTime() - i * 24 * 60 * 60 * 1000);
        emptyWeekly.push({ day: dateLabels[d.getUTCDay()], value: 0 });
      }

      return {
        monthlySeries: emptyMonthly,
        weeklySeries: emptyWeekly,
        kpis: {
          totalRevenue: 0,
          totalBookings: 0,
          avgBookingValue: 0,
          uniquePlayers: 0,
          cancellationRate: 0,
          repeatCustomerRate: 0,
        },
        topCourts: [],
      };
    }

    const venueIds = venues.map((v) => v.id);

    const todayDate = new Date();
    const todayWibStr = utcToWibDateStr(todayDate);
    const [yearStr, monthStr] = todayWibStr.split("-");
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10);

    let windowMonth = month - 11;
    let windowYear = year;
    if (windowMonth < 1) {
      windowMonth += 12;
      windowYear -= 1;
    }
    const windowStartWib = `${windowYear}-${String(windowMonth).padStart(2, "0")}-01T00:00:00.000Z`;
    const windowStart = new Date(windowStartWib);

    const windowBookings = await this.prisma.booking.findMany({
      where: {
        venueId: { in: venueIds },
        bookingDate: { gte: windowStart },
      },
      select: {
        id: true,
        bookingDate: true,
        finalAmount: true,
        status: true,
        hostUserId: true,
        courtId: true,
        court: { select: { name: true } },
        venue: { select: { name: true } },
      },
    });

    const shortMonths = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const monthlySeriesMap = new Map<
      string,
      { month: string; value: number }
    >();
    for (let i = 11; i >= 0; i--) {
      let m = month - i;
      let y = year;
      if (m < 1) {
        m += 12;
        y -= 1;
      }
      const mStr = String(m).padStart(2, "0");
      const key = `${y}-${mStr}`;
      const label = shortMonths[m - 1];
      monthlySeriesMap.set(key, { month: label, value: 0 });
    }

    const dateLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const weeklySeriesMap = new Map<string, { day: string; value: number }>();
    const todayUtcDate = new Date(`${todayWibStr}T00:00:00.000Z`);
    for (let i = 6; i >= 0; i--) {
      const d = new Date(todayUtcDate.getTime() - i * 24 * 60 * 60 * 1000);
      const dSafeStr = d.toISOString().split("T")[0];
      weeklySeriesMap.set(dSafeStr, {
        day: dateLabels[d.getUTCDay()],
        value: 0,
      });
    }

    let totalRevenue = 0;
    let totalBookings = 0;
    let cancelledCount = 0;
    const uniquePlayersMap = new Map<string, number>();
    const topCourtsMap = new Map<
      string,
      {
        courtId: string;
        name: string;
        venue: string;
        bookings: number;
        revenue: number;
      }
    >();

    for (const b of windowBookings) {
      if (
        b.status === BookingStatus.CONFIRMED ||
        b.status === BookingStatus.COMPLETED
      ) {
        totalRevenue += b.finalAmount;
        totalBookings += 1;
        uniquePlayersMap.set(
          b.hostUserId,
          (uniquePlayersMap.get(b.hostUserId) || 0) + 1,
        );

        const wibDateStr = utcToWibDateStr(b.bookingDate);
        const monthKey = wibDateStr.slice(0, 7);
        const mData = monthlySeriesMap.get(monthKey);
        if (mData) {
          mData.value += b.finalAmount;
        }

        const wData = weeklySeriesMap.get(wibDateStr);
        if (wData) {
          wData.value += b.finalAmount;
        }

        const cData = topCourtsMap.get(b.courtId);
        if (cData) {
          cData.bookings += 1;
          cData.revenue += b.finalAmount;
        } else {
          topCourtsMap.set(b.courtId, {
            courtId: b.courtId,
            name: b.court.name,
            venue: b.venue.name,
            bookings: 1,
            revenue: b.finalAmount,
          });
        }
      } else if (b.status === BookingStatus.CANCELLED) {
        cancelledCount += 1;
      }
    }

    const avgBookingValue =
      totalBookings > 0 ? Math.round(totalRevenue / totalBookings) : 0;
    const uniquePlayers = uniquePlayersMap.size;
    const cancellationRate =
      totalBookings + cancelledCount > 0
        ? Math.round(
            (cancelledCount / (totalBookings + cancelledCount)) * 1000,
          ) / 10
        : 0;

    let repeatCustomers = 0;
    for (const count of uniquePlayersMap.values()) {
      if (count >= 2) repeatCustomers++;
    }
    const repeatCustomerRate =
      uniquePlayers > 0
        ? Math.round((repeatCustomers / uniquePlayers) * 100)
        : 0;

    const topCourts = Array.from(topCourtsMap.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    return {
      monthlySeries: Array.from(monthlySeriesMap.values()),
      weeklySeries: Array.from(weeklySeriesMap.values()),
      kpis: {
        totalRevenue,
        totalBookings,
        avgBookingValue,
        uniquePlayers,
        cancellationRate,
        repeatCustomerRate,
      },
      topCourts,
    };
  }
}

export const bookingsService = new BookingsService();
