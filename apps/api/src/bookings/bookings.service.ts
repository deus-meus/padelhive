import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { BookingStatus, CourtType, PaymentStatus, RefundStatus, VenueStatus } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { BookingResponseDto } from "./dto/booking-response.dto";
import { CreateBookingDto } from "./dto/create-booking.dto";
import { OwnerDashboardDto } from "./dto/owner-dashboard.dto";
import { RevenueDto } from "./dto/revenue.dto";
import { getSlotPrice, isWeekendWib, utcToWibDateStr, wibHourFromUtc, wibToUtc } from "../common/pricing.util";
import { 
  PENDING_PAYMENT_TTL_MS, 
  REFUND_WINDOW_MS, 
  REFUND_ELIGIBLE_REASON, 
  REFUND_ELIGIBLE_UNPAID_REASON, 
  REFUND_INELIGIBLE_REASON 
} from "../common/constants";

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

    try {
      return await this.prisma.booking.create({
        data: {
          hostUserId,
          venueId: body.venueId,
          courtId: body.courtId,
          bookingDate: parsedTime.bookingDate,
          startsAt: parsedTime.startsAt,
          endsAt: parsedTime.endsAt,
          durationMinutes: parsedTime.durationMinutes,
          status: BookingStatus.PENDING_PAYMENT,
          expiresAt: new Date(Date.now() + PENDING_PAYMENT_TTL_MS),
          courtAmount,
          platformFee,
          voucherDiscount,
          finalAmount,
        },
        select: bookingSelect,
      });
    } catch (error) {
      const e = error as { message?: string; meta?: { message?: string; target?: unknown } };
      const msg = e?.message || "";
      const metaMsg = e?.meta?.message || "";
      const target = e?.meta?.target || [];

      if (
        msg.includes("booking_no_overlap") ||
        msg.includes("23P01") ||
        metaMsg.includes("booking_no_overlap") ||
        metaMsg.includes("23P01") ||
        (Array.isArray(target) && target.includes("booking_no_overlap")) ||
        (typeof target === "string" && target.includes("booking_no_overlap"))
      ) {
        throw new ConflictException("This court is already booked for the selected time.");
      }
      throw error;
    }
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

  async getOwnerDashboard(userId: string, isSuperAdmin: boolean): Promise<OwnerDashboardDto> {
    const venues = await this.prisma.venue.findMany({
      where: isSuperAdmin ? {} : {
        OR: [{ ownerId: userId }, { admins: { some: { userId } } }]
      },
      select: {
        id: true,
        name: true,
        openTime: true,
        closeTime: true,
        courts: {
          select: { id: true, name: true, isActive: true },
        },
      },
    });

    if (venues.length === 0) {
      return {
        kpis: { weeklyRevenue: 0, weeklyBookings: 0, occupancyRate: 0, activeCourts: 0, pendingPayments: 0 },
        revenueSeries: [],
        courtUtilization: [],
        todaysSchedule: [],
        recentBookings: [],
      };
    }

    const venueIds = venues.map((v) => v.id);
    const activeCourts = venues.flatMap((v) =>
      v.courts.filter((c) => c.isActive).map((c) => ({ ...c, venueId: v.id, openTime: v.openTime, closeTime: v.closeTime }))
    );

    const todayDate = new Date();
    const todayWibStr = utcToWibDateStr(todayDate);
    const todayUtcDate = new Date(`${todayWibStr}T00:00:00.000Z`);

    const dateLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const revenueSeriesMap = new Map<string, { date: string; label: string; value: number }>();
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date(todayUtcDate.getTime() - i * 24 * 60 * 60 * 1000);
      const dSafeStr = d.toISOString().split("T")[0];
      revenueSeriesMap.set(dSafeStr, {
        date: dSafeStr,
        label: dateLabels[d.getUTCDay()],
        value: 0,
      });
    }

    const weekStart = new Date(todayUtcDate.getTime() - 6 * 24 * 60 * 60 * 1000);
    const weekEndExclusive = new Date(todayUtcDate.getTime() + 1 * 24 * 60 * 60 * 1000);

    const windowBookings = await this.prisma.booking.findMany({
      where: {
        venueId: { in: venueIds },
        bookingDate: { gte: weekStart, lt: weekEndExclusive },
      },
      select: {
        id: true,
        bookingDate: true,
        startsAt: true,
        durationMinutes: true,
        status: true,
        finalAmount: true,
        courtId: true,
        court: { select: { id: true, name: true } },
        venue: { select: { name: true } },
        host: { select: { name: true } },
      },
    });

    let weeklyRevenue = 0;
    let weeklyBookings = 0;
    const courtBookedMinutes = new Map<string, number>();

    for (const b of windowBookings) {
      if (b.status === BookingStatus.CONFIRMED || b.status === BookingStatus.COMPLETED) {
        weeklyRevenue += b.finalAmount;
        
        const wibDateStr = utcToWibDateStr(b.bookingDate);
        const dayStats = revenueSeriesMap.get(wibDateStr);
        if (dayStats) {
          dayStats.value += b.finalAmount;
        }

        const booked = courtBookedMinutes.get(b.courtId) || 0;
        courtBookedMinutes.set(b.courtId, booked + b.durationMinutes);
      }
      
      if (b.status === BookingStatus.CONFIRMED || b.status === BookingStatus.COMPLETED || b.status === BookingStatus.PENDING_PAYMENT) {
        weeklyBookings += 1;
      }
    }

    const courtUtilization = [];
    let totalOccupancyRate = 0;
    let countedActiveCourts = 0;

    for (const c of activeCourts) {
      const openHour = parseInt(c.openTime.split(":")[0], 10);
      const closeHour = parseInt(c.closeTime.split(":")[0], 10);
      const hoursPerDay = closeHour - openHour;
      let capacityHours = 0;
      if (hoursPerDay > 0) {
        capacityHours = hoursPerDay * 7;
      }

      const bookedHours = (courtBookedMinutes.get(c.id) || 0) / 60;
      let rate = 0;
      if (capacityHours > 0) {
        rate = Math.round(Math.min(100, (bookedHours / capacityHours) * 100));
      }
      
      courtUtilization.push({
        courtId: c.id,
        name: c.name,
        occupancyRate: rate,
      });

      if (capacityHours > 0) {
        totalOccupancyRate += rate;
        countedActiveCourts += 1;
      }
    }

    courtUtilization.sort((a, b) => b.occupancyRate - a.occupancyRate);
    const occupancyRate = countedActiveCourts > 0 ? Math.round(totalOccupancyRate / countedActiveCourts) : 0;

    const pendingPayments = await this.prisma.booking.count({
      where: {
        venueId: { in: venueIds },
        status: BookingStatus.PENDING_PAYMENT,
      },
    });

    const todaysSchedule = windowBookings
      .filter((b) => b.bookingDate.getTime() === todayUtcDate.getTime() && (b.status === BookingStatus.CONFIRMED || b.status === BookingStatus.PENDING_PAYMENT))
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

  async getRevenue(userId: string, isSuperAdmin: boolean): Promise<RevenueDto> {
    const venues = await this.prisma.venue.findMany({
      where: isSuperAdmin ? {} : {
        OR: [{ ownerId: userId }, { admins: { some: { userId } } }]
      },
      select: { id: true },
    });

    if (venues.length === 0) {
      const emptyMonthly = [];
      const shortMonths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const dateLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const todayDate = new Date();
      const todayWibStr = utcToWibDateStr(todayDate);
      const [, monthStr] = todayWibStr.split('-');
      // const year = parseInt(yearStr, 10);
      const month = parseInt(monthStr, 10);

      for (let i = 11; i >= 0; i--) {
        let m = month - i;
        if (m < 1) { m += 12; }
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
    const [yearStr, monthStr] = todayWibStr.split('-');
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10);

    let windowMonth = month - 11;
    let windowYear = year;
    if (windowMonth < 1) {
      windowMonth += 12;
      windowYear -= 1;
    }
    const windowStartWib = `${windowYear}-${String(windowMonth).padStart(2, '0')}-01T00:00:00.000Z`;
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

    const shortMonths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthlySeriesMap = new Map<string, { month: string; value: number }>();
    for (let i = 11; i >= 0; i--) {
      let m = month - i;
      let y = year;
      if (m < 1) {
        m += 12;
        y -= 1;
      }
      const mStr = String(m).padStart(2, '0');
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
    const topCourtsMap = new Map<string, { courtId: string; name: string; venue: string; bookings: number; revenue: number }>();

    for (const b of windowBookings) {
      if (b.status === BookingStatus.CONFIRMED || b.status === BookingStatus.COMPLETED) {
        totalRevenue += b.finalAmount;
        totalBookings += 1;
        uniquePlayersMap.set(b.hostUserId, (uniquePlayersMap.get(b.hostUserId) || 0) + 1);

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

    const avgBookingValue = totalBookings > 0 ? Math.round(totalRevenue / totalBookings) : 0;
    const uniquePlayers = uniquePlayersMap.size;
    const cancellationRate = (totalBookings + cancelledCount) > 0 
      ? Math.round((cancelledCount / (totalBookings + cancelledCount)) * 1000) / 10 
      : 0;
    
    let repeatCustomers = 0;
    for (const count of uniquePlayersMap.values()) {
      if (count >= 2) repeatCustomers++;
    }
    const repeatCustomerRate = uniquePlayers > 0 ? Math.round((repeatCustomers / uniquePlayers) * 100) : 0;

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
