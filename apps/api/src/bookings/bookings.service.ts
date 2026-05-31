import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { BookingStatus, CourtType, VenueStatus } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { BookingResponseDto } from "./dto/booking-response.dto";
import { CreateBookingDto } from "./dto/create-booking.dto";

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

    const startsAt = new Date(`${bookingDateValue}T${startsAtValue}:00.000Z`);
    const endsAt = new Date(`${bookingDateValue}T${endsAtValue}:00.000Z`);

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
      const slotStart = new Date(startsAt);
      slotStart.setUTCHours(startsAt.getUTCHours() + slot);
      amount += this.getHourlyRate(court, slotStart);
    }

    return amount;
  }

  private getHourlyRate(court: SelectedCourt, slotStart: Date): number {
    const isWeekend = slotStart.getUTCDay() === 0 || slotStart.getUTCDay() === 6;
    const hour = slotStart.getUTCHours();
    const isPeak = (hour >= 9 && hour <= 10) || (hour >= 16 && hour <= 20);

    if (isWeekend) {
      return isPeak ? court.weekendPeak : court.weekendOffPeak;
    }

    return isPeak ? court.weekdayPeak : court.weekdayOffPeak;
  }
}
