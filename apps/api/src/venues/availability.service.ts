import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { BookingStatus, VenueStatus } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import {
  VenueAvailabilityCourtDto,
  VenueAvailabilityResponseDto,
  VenueAvailabilitySlotDto,
} from "./dto/venue-availability-response.dto";
import { getSlotPrice, isPeakHour, isWeekendWib, wibToUtc } from "../common/pricing.util";

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const DEFAULT_OPEN_HOUR = 6;
const DEFAULT_CLOSE_HOUR = 22;
const TIMEZONE = "Asia/Jakarta";

@Injectable()
export class AvailabilityService {
  constructor(private readonly prisma: PrismaService) {}

  async getVenueAvailability(
    venueId: string,
    dateStr: string,
    courtId?: string
  ): Promise<VenueAvailabilityResponseDto> {
    if (!DATE_PATTERN.test(dateStr)) {
      throw new BadRequestException("date must use YYYY-MM-DD format");
    }

    const venue = await this.prisma.venue.findFirst({
      where: { id: venueId, status: VenueStatus.APPROVED },
      select: { id: true, openTime: true, closeTime: true, weeklyHours: true },
    });

    if (!venue) {
      throw new NotFoundException("Venue not found");
    }

    const dayIdx = new Date(dateStr + "T12:00:00Z").getUTCDay();
    const key = ["sun","mon","tue","wed","thu","fri","sat"][dayIdx];

    let startHour = this.parseOperatingHour(venue.openTime, DEFAULT_OPEN_HOUR);
    let endHour = this.parseOperatingHour(venue.closeTime, DEFAULT_CLOSE_HOUR);
    let isClosed = false;

    if (venue.weeklyHours && typeof venue.weeklyHours === "object" && key in venue.weeklyHours) {
      const entry = (venue.weeklyHours as Record<string, { open?: string; close?: string; closed?: boolean }>)[key];
      if (entry.closed === true) {
        isClosed = true;
      } else {
        if (entry.open) startHour = this.parseOperatingHour(entry.open, DEFAULT_OPEN_HOUR);
        if (entry.close) endHour = this.parseOperatingHour(entry.close, DEFAULT_CLOSE_HOUR);
      }
    }

    const courtWhere: { venueId: string; isActive: boolean; id?: string } = {
      venueId,
      isActive: true,
    };

    if (courtId) {
      courtWhere.id = courtId;
    }

    const courts = await this.prisma.court.findMany({
      where: courtWhere,
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        type: true,
        weekdayPeak: true,
        weekdayOffPeak: true,
        weekendPeak: true,
        weekendOffPeak: true,
      },
    });

    if (courts.length === 0 || isClosed) {
      return {
        date: dateStr,
        timezone: TIMEZONE,
        courts: courts.map(c => ({
          id: c.id,
          name: c.name,
          type: c.type,
          weekdayPeak: c.weekdayPeak,
          weekdayOffPeak: c.weekdayOffPeak,
          weekendPeak: c.weekendPeak,
          weekendOffPeak: c.weekendOffPeak,
          slots: [],
        })),
      };
    }

    const bookingDate = new Date(`${dateStr}T00:00:00.000Z`);
    const dayStart = wibToUtc(dateStr, `${String(startHour).padStart(2, "0")}:00`);
    const dayEnd = wibToUtc(dateStr, `${String(endHour).padStart(2, "0")}:00`);

    const courtIds = courts.map((c) => c.id);

    const bookings = await this.prisma.booking.findMany({
      where: {
        venueId,
        courtId: { in: courtIds },
        bookingDate,
        status: { in: [BookingStatus.PENDING_PAYMENT, BookingStatus.CONFIRMED] },
        startsAt: { lt: dayEnd },
        endsAt: { gt: dayStart },
      },
      select: {
        courtId: true,
        startsAt: true,
        endsAt: true,
      },
    });

    const isWeekend = isWeekendWib(dateStr);

    const courtDtos: VenueAvailabilityCourtDto[] = courts.map((court) => {
      const courtBookings = bookings.filter((b) => b.courtId === court.id);
      const slots = this.generateSlots(
        court,
        startHour,
        endHour,
        dateStr,
        isWeekend,
        courtBookings
      );
      return {
        id: court.id,
        name: court.name,
        type: court.type,
        slots,
      };
    });

    return {
      date: dateStr,
      timezone: TIMEZONE,
      courts: courtDtos,
    };
  }

  private parseOperatingHour(timeStr: string, fallback: number): number {
    if (!timeStr) return fallback;
    const hour = parseInt(timeStr.split(":")[0], 10);
    return Number.isNaN(hour) ? fallback : hour;
  }



  private generateSlots(
    court: {
      id: string;
      weekdayPeak: number;
      weekdayOffPeak: number;
      weekendPeak: number;
      weekendOffPeak: number;
    },
    startHour: number,
    endHour: number,
    dateStr: string,
    isWeekend: boolean,
    bookings: { courtId: string; startsAt: Date; endsAt: Date }[]
  ): VenueAvailabilitySlotDto[] {
    const slots: VenueAvailabilitySlotDto[] = [];

    for (let hour = startHour; hour < endHour; hour++) {
      const startsAt = `${String(hour).padStart(2, "0")}:00`;
      const endsAt = `${String(hour + 1).padStart(2, "0")}:00`;

      const slotStart = wibToUtc(dateStr, startsAt);
      const slotEnd = wibToUtc(dateStr, endsAt);

      const isPeak = isPeakHour(hour, isWeekend);
      const price = getSlotPrice(court, hour, isWeekend);

      const available = !bookings.some(
        (b) => b.startsAt < slotEnd && b.endsAt > slotStart
      );

      slots.push({
        startsAt,
        endsAt,
        available,
        price,
        isPeak,
      });
    }

    return slots;
  }
}