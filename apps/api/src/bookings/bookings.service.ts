import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { BookingStatus, CourtType, PaymentStatus, RefundStatus, VenueStatus } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { BookingResponseDto } from "./dto/booking-response.dto";
import { CreateBookingDto } from "./dto/create-booking.dto";
import { getSlotPrice, isWeekendWib, utcToWibDateStr, wibHourFromUtc, wibToUtc } from "../common/pricing.util";

type BookingFilter = "upcoming" | "past" | "cancelled";

const PLATFORM_FEE_RATE = 0.05;
const TIME_PATTERN = /^([01]\d|2[0-3]):00$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const REFUND_WINDOW_MS = 24 * 60 * 60 * 1000;
const REFUND_ELIGIBLE_REASON = "Full refund eligible: cancelled at least 24 hours before booking start.";
const REFUND_ELIGIBLE_UNPAID_REASON = "Full refund eligible, but no paid payment exists for this booking.";
const REFUND_INELIGIBLE_REASON = "Non-refundable: cancellations less than 24 hours before booking start are not eligible.";

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
  cancelledAt: true,
  payment: {
    select: {
      id: true,
      amount: true,
      status: true,
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
  cancelledAt: Date | null;
  venue: { id: string; name: string; city: string };
  court: { id: string; name: string; type: CourtType };
  host: { id: string; name: string | null; email: string };
  payment: { id: string; amount: number; status: PaymentStatus } | null;
};

type RefundDecision = {
  isRefundEligible: boolean;
  refundAmount: number;
  refundPolicyReason: string;
};

type SelectedCourt = {
  id: string;
  venueId: string;
  name: string;
  type: CourtType;
  isActive: boolean;
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

@Injectable()
export class BookingsService {
  constructor(private readonly prisma: PrismaService) {}

  async createBookingForUser(hostUserId: string, body: CreateBookingDto): Promise<BookingResponseDto> {
    const parsedTime = this.parseBookingTime(body.bookingDate, body.startsAt, body.endsAt);

    const venue = await this.prisma.venue.findFirst({
      where: { id: body.venueId, status: VenueStatus.APPROVED },
      select: { id: true, name: true, city: true, status: true },
    });

    if (!venue) {
      throw new NotFoundException("Venue not found");
    }

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
      throw new NotFoundException("Court not found");
    }

    await this.assertNoOverlap(body.courtId, parsedTime.startsAt, parsedTime.endsAt);

    const courtAmount = this.calculateCourtAmount(court, parsedTime.startsAt, parsedTime.durationMinutes);
    const platformFee = Math.round(courtAmount * PLATFORM_FEE_RATE);
    const voucherDiscount = 0;
    const finalAmount = courtAmount + platformFee - voucherDiscount;

    return this.prisma.booking.create({
      data: {
        hostUserId,
        venueId: body.venueId,
        courtId: body.courtId,
        bookingDate: parsedTime.bookingDate,
        startsAt: parsedTime.startsAt,
        endsAt: parsedTime.endsAt,
        durationMinutes: parsedTime.durationMinutes,
        status: BookingStatus.PENDING_PAYMENT,
        courtAmount,
        platformFee,
        voucherDiscount,
        finalAmount,
      },
      select: bookingSelect,
    });
  }

  async findBookingForUser(id: string, hostUserId: string): Promise<BookingResponseDto> {
    const booking = await this.prisma.booking.findFirst({
      where: { id, hostUserId },
      select: bookingSelect,
    });

    if (!booking) {
      throw new NotFoundException("Booking not found");
    }

    return booking;
  }

  async cancelBookingForUser(id: string, hostUserId: string, now = new Date()): Promise<BookingResponseDto> {
    const booking = await this.prisma.booking.findFirst({
      where: { id, hostUserId },
      select: cancellableBookingSelect,
    });

    if (!booking) {
      throw new NotFoundException("Booking not found");
    }

    if (booking.status === BookingStatus.COMPLETED) {
      throw new BadRequestException("Completed bookings cannot be cancelled");
    }

    if (booking.status === BookingStatus.CANCELLED) {
      throw new BadRequestException("Booking is already cancelled");
    }

    if (booking.status !== BookingStatus.CONFIRMED && booking.status !== BookingStatus.PENDING_PAYMENT) {
      throw new BadRequestException("Booking cannot be cancelled");
    }

    const refundDecision = this.calculateRefundDecision(booking, now);

    const cancelledBooking = await this.prisma.$transaction(async (tx) => {
      const updatedBooking = await tx.booking.update({
        where: { id: booking.id },
        data: { status: BookingStatus.CANCELLED, cancelledAt: now },
        select: cancellableBookingSelect,
      });

      if (booking.payment?.status === PaymentStatus.PAID && refundDecision.isRefundEligible) {
        await tx.refund.create({
          data: {
            bookingId: booking.id,
            paymentId: booking.payment.id,
            amount: booking.payment.amount,
            reason: REFUND_ELIGIBLE_REASON,
            status: RefundStatus.PENDING,
          },
        });
      }

      return updatedBooking;
    });

    return this.withRefundDecision(cancelledBooking, refundDecision);
  }

  private calculateRefundDecision(booking: CancellableBooking, now: Date): RefundDecision {
    const isRefundEligible = booking.startsAt.getTime() - now.getTime() >= REFUND_WINDOW_MS;
    const hasPaidPayment = booking.payment?.status === PaymentStatus.PAID;

    if (isRefundEligible && hasPaidPayment) {
      return {
        isRefundEligible: true,
        refundAmount: booking.payment?.amount ?? 0,
        refundPolicyReason: REFUND_ELIGIBLE_REASON,
      };
    }

    if (isRefundEligible) {
      return {
        isRefundEligible: true,
        refundAmount: 0,
        refundPolicyReason: REFUND_ELIGIBLE_UNPAID_REASON,
      };
    }

    return {
      isRefundEligible: false,
      refundAmount: 0,
      refundPolicyReason: REFUND_INELIGIBLE_REASON,
    };
  }

  private withRefundDecision(booking: CancellableBooking, refundDecision: RefundDecision): BookingResponseDto {
    return {
      id: booking.id,
      bookingDate: booking.bookingDate,
      startsAt: booking.startsAt,
      endsAt: booking.endsAt,
      durationMinutes: booking.durationMinutes,
      status: booking.status,
      courtAmount: booking.courtAmount,
      platformFee: booking.platformFee,
      voucherDiscount: booking.voucherDiscount,
      finalAmount: booking.finalAmount,
      venue: booking.venue,
      court: booking.court,
      host: booking.host,
      ...refundDecision,
    };
  }

  private parseBookingTime(bookingDateValue: string, startsAtValue: string, endsAtValue: string): ParsedBookingTime {
    if (!DATE_PATTERN.test(bookingDateValue)) {
      throw new BadRequestException("bookingDate must use YYYY-MM-DD format");
    }

    if (!TIME_PATTERN.test(startsAtValue) || !TIME_PATTERN.test(endsAtValue)) {
      throw new BadRequestException("startsAt and endsAt must be whole-hour HH:mm values");
    }

    const bookingDate = new Date(`${bookingDateValue}T00:00:00.000Z`);
    if (Number.isNaN(bookingDate.getTime()) || bookingDate.toISOString().slice(0, 10) !== bookingDateValue) {
      throw new BadRequestException("bookingDate must be a valid calendar date");
    }

    const startsAt = wibToUtc(bookingDateValue, startsAtValue);
    const endsAt = wibToUtc(bookingDateValue, endsAtValue);

    if (endsAt <= startsAt) {
      throw new BadRequestException("endsAt must be after startsAt");
    }

    if (startsAt <= new Date()) {
      throw new BadRequestException("Booking start time must be in the future");
    }

    const durationMinutes = Math.round((endsAt.getTime() - startsAt.getTime()) / 60000);

    if (durationMinutes <= 0 || durationMinutes % 60 !== 0) {
      throw new BadRequestException("Booking duration must be whole hours");
    }

    return { bookingDate, startsAt, endsAt, durationMinutes };
  }

  private async assertNoOverlap(courtId: string, startsAt: Date, endsAt: Date): Promise<void> {
    const overlap = await this.prisma.booking.findFirst({
      where: {
        courtId,
        status: { in: [BookingStatus.PENDING_PAYMENT, BookingStatus.CONFIRMED] },
        startsAt: { lt: endsAt },
        endsAt: { gt: startsAt },
      },
      select: { id: true },
    });

    if (overlap) {
      throw new ConflictException("Court is unavailable for the requested time");
    }
  }

  private calculateCourtAmount(court: SelectedCourt, startsAt: Date, durationMinutes: number): number {
    const slotCount = durationMinutes / 60;
    let amount = 0;

    for (let slot = 0; slot < slotCount; slot += 1) {
      const slotStart = new Date(startsAt.getTime() + slot * 60 * 60 * 1000);
      const wibDateStr = utcToWibDateStr(slotStart);
      const isWeekend = isWeekendWib(wibDateStr);
      const wibHour = wibHourFromUtc(slotStart);

      amount += getSlotPrice(court, wibHour, isWeekend);
    }

    return amount;
  }

  async findBookingsForUser(hostUserId: string, filter: BookingFilter) {
    const wibTodayStr = utcToWibDateStr(new Date());
    const todayStart = new Date(`${wibTodayStr}T00:00:00.000Z`);

    const where: { hostUserId: string; status?: { in: BookingStatus[] } | BookingStatus; bookingDate?: { gte: Date } | { lt: Date }; OR?: { status: BookingStatus }[] } = { hostUserId };

    switch (filter) {
      case "upcoming":
        where.status = { in: [BookingStatus.PENDING_PAYMENT, BookingStatus.CONFIRMED] };
        where.bookingDate = { gte: todayStart };
        break;
      case "past":
        where.status = BookingStatus.COMPLETED;
        break;
      case "cancelled":
        where.status = BookingStatus.CANCELLED;
        break;
    }

    return this.prisma.booking.findMany({
      where,
      orderBy: { bookingDate: "desc" },
      select: {
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
      },
    });
  }

}
