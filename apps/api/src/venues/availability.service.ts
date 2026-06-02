import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { BookingStatus, VenueStatus } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import {
  VenueAvailabilityCourtDto,
  VenueAvailabilityResponseDto,
  VenueAvailabilitySlotDto,
} from "./dto/venue-availability-response.dto";

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
      select: { id: true, openTime: true, closeTime: true },
    });

    if (!venue) {
      throw new NotFoundException("Venue not found");
    }

    const startHour = this.parseOperatingHour(venue.openTime, DEFAULT_OPEN_HOUR);
    const endHour = this.parseOperatingHour(venue.closeTime, DEFAULT_CLOSE_HOUR);

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

    if (courts.length === 0) {
      return {
        date: dateStr,
        timezone: TIMEZONE,
        courts: [],
      };
    }

    const bookingDate = new Date(`${dateStr}T00:00:00.000Z`);
    const dayStart = new Date(`${dateStr}T${String(startHour).padStart(2, "0")}:00:00.000Z`);
    const dayEnd = new Date(`${dateStr}T${String(endHour).padStart(2, "0")}:00:00.000Z`);

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

    const isWeekend = this.isWeekend(dateStr);

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

  private isWeekend(dateStr: string): boolean {
    const date = new Date(`${dateStr}T00:00:00.000Z`);
    const day = date.getUTCDay();
    return day === 0 || day === 6;
  }

  private isPeakHour(hour: number, isWeekend: boolean): boolean {
    if (isWeekend) {
      return (hour >= 8 && hour < 12) || (hour >= 16 && hour < 21);
    }
    return hour >= 17 && hour < 21;
  }

  private getSlotPrice(
    court: {
      weekdayPeak: number;
      weekdayOffPeak: number;
      weekendPeak: number;
      weekendOffPeak: number;
    },
    hour: number,
    isWeekend: boolean
  ): number {
    const peak = this.isPeakHour(hour, isWeekend);

    if (isWeekend) {
      return peak ? court.weekendPeak : court.weekendOffPeak;
    }

    return peak ? court.weekdayPeak : court.weekdayOffPeak;
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

      const slotStart = new Date(`${dateStr}T${startsAt}:00.000Z`);
      const slotEnd = new Date(`${dateStr}T${endsAt}:00.000Z`);

      const isPeak = this.isPeakHour(hour, isWeekend);
      const price = this.getSlotPrice(court, hour, isWeekend);

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