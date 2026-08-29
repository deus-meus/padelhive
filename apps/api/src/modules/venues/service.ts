import {
  BookingStatus,
  type CourtType,
  NotificationType,
  Prisma,
  UserRole,
  VenueStatus,
} from "@prisma/client";
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from "../../common/errors";
import {
  getSlotPrice,
  isOvernight,
  isPeakHour,
  isWeekendWib,
  utcToWibDateStr,
  wibHourFromUtc,
  wibToUtc,
} from "../../common/pricing.util";
import {
  prisma as defaultPrisma,
  type PrismaService,
} from "../../common/prisma";
import {
  notificationsService as defaultNotifications,
  type NotificationsService,
} from "../notifications/service";
import type {
  CreateVenueInput,
  UpdateVenueInput,
  VenueFilterInput,
} from "./model";

const venueSelect = {
  id: true,
  name: true,
  slug: true,
  location: true,
  city: true,
  description: true,
  imageUrl: true,
  photos: true,
  facilities: true,
  openTime: true,
  closeTime: true,
  weeklyHours: true,
  rating: true,
  reviewCount: true,
  status: true,
  courts: {
    where: { isActive: true },
    select: { weekdayOffPeak: true },
  },
  _count: {
    select: { courts: { where: { isActive: true } } },
  },
};

type SelectedVenue = {
  id: string;
  name: string;
  slug: string;
  location: string;
  city: string;
  description: string;
  imageUrl: string | null;
  photos: string[];
  facilities: string[];
  openTime: string;
  closeTime: string;
  status: VenueStatus;
  reviewCount: number;
  rating: { toNumber: () => number } | number;
  weeklyHours: Prisma.JsonValue | null;
  courts: { weekdayOffPeak: number }[];
  _count: { courts: number };
};

export class VenuesService {
  constructor(
    private readonly prisma: PrismaService = defaultPrisma,
    private readonly notifications: NotificationsService = defaultNotifications,
  ) {}

  async findApprovedVenues(filters?: VenueFilterInput) {
    const where: Prisma.VenueWhereInput = { status: VenueStatus.APPROVED };

    if (filters?.q?.trim()) {
      where.name = { contains: filters.q.trim(), mode: "insensitive" };
    }

    if (filters?.city?.trim() && filters.city.trim() !== "All") {
      where.city = { equals: filters.city.trim(), mode: "insensitive" };
    }

    if (filters?.rating) {
      const ratingValue = parseFloat(filters.rating);
      if (Number.isFinite(ratingValue) && ratingValue > 0) {
        where.rating = { gte: ratingValue };
      }
    }

    if (filters?.facilities) {
      const list = filters.facilities
        .split(",")
        .map((f: string) => f.trim())
        .filter((f: string) => f.length > 0);
      if (list.length > 0) {
        where.facilities = { hasEvery: list };
      }
    }

    if (filters?.type === "INDOOR" || filters?.type === "OUTDOOR") {
      where.courts = {
        some: { isActive: true, type: filters.type as CourtType },
      };
    }

    const venues = await this.prisma.venue.findMany({
      where,
      orderBy: [{ city: "asc" }, { name: "asc" }],
      select: venueSelect,
    });

    let mapped = venues.map((venue) =>
      this.toVenueResponse(venue as SelectedVenue),
    );

    if (filters?.priceMin || filters?.priceMax) {
      const pMin = filters.priceMin ? parseInt(filters.priceMin, 10) : null;
      const pMax = filters.priceMax ? parseInt(filters.priceMax, 10) : null;

      const validPMin =
        pMin !== null && Number.isFinite(pMin) && !Number.isNaN(pMin)
          ? pMin
          : null;
      const validPMax =
        pMax !== null && Number.isFinite(pMax) && !Number.isNaN(pMax)
          ? pMax
          : null;

      mapped = mapped.filter((v) => {
        const passMin = validPMin === null || v.priceFrom >= validPMin;
        const passMax = validPMax === null || v.priceFrom <= validPMax;
        return passMin && passMax;
      });
    }

    return mapped;
  }

  async findApprovedVenueById(id: string) {
    const venue = await this.prisma.venue.findFirst({
      where: { id, status: VenueStatus.APPROVED },
      select: venueSelect,
    });

    if (!venue) {
      throw new NotFoundException("Venue not found");
    }

    return this.toVenueResponse(venue as SelectedVenue);
  }

  private toVenueResponse(venue: SelectedVenue) {
    const { courts, _count, ...rest } = venue;
    return {
      ...rest,
      weeklyHours: venue.weeklyHours
        ? (venue.weeklyHours as Record<
            string,
            { open: string; close: string; closed?: boolean }
          >)
        : null,
      rating:
        typeof venue.rating === "number"
          ? venue.rating
          : venue.rating.toNumber(),
      courtCount: _count.courts,
      priceFrom:
        courts.length > 0
          ? Math.min(...courts.map((c) => c.weekdayOffPeak))
          : 0,
    };
  }

  private async assertVenueManageable(
    venueId: string,
    userId: string,
    isSuperAdmin: boolean,
  ): Promise<void> {
    const venue = await this.prisma.venue.findUnique({
      where: { id: venueId },
      select: {
        id: true,
        ownerId: true,
        admins: { where: { userId }, select: { id: true } },
      },
    });
    if (!venue) throw new NotFoundException("Venue not found");
    if (
      !isSuperAdmin &&
      venue.ownerId !== userId &&
      venue.admins.length === 0
    ) {
      throw new ForbiddenException("You don't have access to this venue");
    }
  }

  private validateVenueFields(
    fields: Record<string, unknown>,
    { partial }: { partial: boolean },
  ): void {
    if (partial && Object.keys(fields).length === 0)
      throw new BadRequestException("No fields to update");

    const stringFields = [
      "name",
      "location",
      "city",
      "description",
      "openTime",
      "closeTime",
    ];
    for (const field of stringFields) {
      if (!partial || fields[field] !== undefined) {
        if (
          typeof fields[field] !== "string" ||
          (fields[field] as string).trim() === ""
        ) {
          throw new BadRequestException(`${field} is required`);
        }
      }
    }

    if (fields.openTime !== undefined && fields.closeTime !== undefined) {
      const open = fields.openTime as string;
      const close = fields.closeTime as string;
      if (/^\d{2}:\d{2}$/.test(open) && /^\d{2}:\d{2}$/.test(close)) {
        if (open === close) {
          throw new BadRequestException(
            "openTime and closeTime cannot be equal",
          );
        }
      }
    }

    if (fields.imageUrl !== undefined && typeof fields.imageUrl !== "string") {
      throw new BadRequestException("imageUrl must be a string");
    }

    const arrayFields = ["photos", "facilities"];
    for (const field of arrayFields) {
      if (fields[field] !== undefined) {
        if (
          !Array.isArray(fields[field]) ||
          !(fields[field] as unknown[]).every(
            (item) => typeof item === "string",
          )
        ) {
          throw new BadRequestException(`${field} must be an array of strings`);
        }
      }
    }

    if (fields.weeklyHours !== undefined && fields.weeklyHours !== null) {
      if (
        typeof fields.weeklyHours !== "object" ||
        Array.isArray(fields.weeklyHours)
      ) {
        throw new BadRequestException("weeklyHours must be an object");
      }
      const validKeys = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
      for (const [key, val] of Object.entries(
        fields.weeklyHours as Record<string, unknown>,
      )) {
        if (!validKeys.includes(key)) {
          throw new BadRequestException(`Unknown key in weeklyHours: ${key}`);
        }
        const value = val as {
          open?: string;
          close?: string;
          closed?: boolean;
        };
        if (value.closed !== true) {
          if (
            typeof value.open !== "string" ||
            !/^\d{2}:\d{2}$/.test(value.open)
          ) {
            throw new BadRequestException(
              "weeklyHours open must be HH:MM string",
            );
          }
          if (
            typeof value.close !== "string" ||
            !/^\d{2}:\d{2}$/.test(value.close)
          ) {
            throw new BadRequestException(
              "weeklyHours close must be HH:MM string",
            );
          }
          if (value.close === value.open) {
            throw new BadRequestException(
              "weeklyHours open and close cannot be equal",
            );
          }
        }
      }
    }
  }

  private async generateUniqueSlug(name: string): Promise<string> {
    const base =
      name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "") || "venue";
    let slug = base;
    let counter = 2;
    let isUnique = false;
    while (!isUnique) {
      const existing = await this.prisma.venue.findUnique({
        where: { slug },
        select: { id: true },
      });
      if (!existing) {
        isUnique = true;
        return slug;
      }
      slug = `${base}-${counter}`;
      counter++;
    }
    return slug;
  }

  private async notifySuperAdminsVenueSubmitted(
    ownerId: string,
    venueName: string,
  ): Promise<void> {
    try {
      const superAdmins = await this.prisma.user.findMany({
        where: { role: UserRole.SUPER_ADMIN },
        select: { id: true },
      });
      await Promise.all(
        superAdmins
          .filter((a) => a.id !== ownerId)
          .map((a) =>
            this.notifications.createNotification({
              userId: a.id,
              type: NotificationType.VENUE_SUBMITTED,
              title: "New venue submitted",
              body: `A new venue "${venueName}" is awaiting approval.`,
              linkUrl: `/admin/venues`,
            }),
          ),
      );
    } catch (err) {
      console.warn(
        `[VenuesService] Failed to emit venue-submitted notifications: ${String(err)}`,
      );
    }
  }

  async findVenuesForManagement(userId: string, isSuperAdmin: boolean) {
    const where = isSuperAdmin
      ? {}
      : { OR: [{ ownerId: userId }, { admins: { some: { userId } } }] };
    const venues = await this.prisma.venue.findMany({
      where,
      orderBy: [{ createdAt: "desc" }],
      select: venueSelect,
    });
    return venues.map((v) => this.toVenueResponse(v as SelectedVenue));
  }

  async createVenue(userId: string, dto: CreateVenueInput) {
    this.validateVenueFields(dto as unknown as Record<string, unknown>, {
      partial: false,
    });
    const slug = await this.generateUniqueSlug(dto.name);

    try {
      const venue = await this.prisma.venue.create({
        data: {
          ownerId: userId,
          status: VenueStatus.PENDING,
          name: dto.name.trim(),
          slug,
          location: dto.location.trim(),
          city: dto.city.trim(),
          description: dto.description.trim(),
          imageUrl: dto.imageUrl?.trim() || null,
          photos: dto.photos ?? [],
          facilities: dto.facilities ?? [],
          openTime: dto.openTime.trim(),
          closeTime: dto.closeTime.trim(),
          weeklyHours: dto.weeklyHours
            ? (dto.weeklyHours as Prisma.InputJsonValue)
            : Prisma.JsonNull,
        },
        select: venueSelect,
      });
      await this.notifySuperAdminsVenueSubmitted(userId, venue.name);
      return this.toVenueResponse(venue as SelectedVenue);
    } catch (error: unknown) {
      if (
        error &&
        typeof error === "object" &&
        "code" in error &&
        (error as { code?: string }).code === "P2002"
      ) {
        throw new ConflictException("A venue with this name already exists");
      }
      throw error;
    }
  }

  async updateVenue(
    id: string,
    userId: string,
    isSuperAdmin: boolean,
    dto: UpdateVenueInput,
  ) {
    await this.assertVenueManageable(id, userId, isSuperAdmin);

    const fieldsToValidate = Object.fromEntries(
      Object.entries(dto).filter(([, v]) => v !== undefined),
    );
    this.validateVenueFields(fieldsToValidate, { partial: true });

    const data: Prisma.VenueUpdateInput = {};
    if (dto.name !== undefined) data.name = dto.name.trim();
    if (dto.location !== undefined) data.location = dto.location.trim();
    if (dto.city !== undefined) data.city = dto.city.trim();
    if (dto.description !== undefined)
      data.description = dto.description.trim();
    if (dto.imageUrl !== undefined) data.imageUrl = dto.imageUrl.trim() || null;
    if (dto.photos !== undefined) data.photos = dto.photos;
    if (dto.facilities !== undefined) data.facilities = dto.facilities;
    if (dto.openTime !== undefined) data.openTime = dto.openTime.trim();
    if (dto.closeTime !== undefined) data.closeTime = dto.closeTime.trim();
    if (dto.weeklyHours !== undefined) {
      data.weeklyHours =
        dto.weeklyHours === null
          ? Prisma.JsonNull
          : (dto.weeklyHours as Prisma.InputJsonValue);
    }

    try {
      const venue = await this.prisma.venue.update({
        where: { id },
        data,
        select: venueSelect,
      });
      return this.toVenueResponse(venue as SelectedVenue);
    } catch (error: unknown) {
      if (
        error &&
        typeof error === "object" &&
        "code" in error &&
        (error as { code?: string }).code === "P2002"
      ) {
        throw new ConflictException("A venue with this name already exists");
      }
      throw error;
    }
  }

  async findVenuesForAdmin(status?: VenueStatus) {
    const where: Prisma.VenueWhereInput =
      status && Object.values(VenueStatus).includes(status) ? { status } : {};
    const venues = await this.prisma.venue.findMany({
      where,
      orderBy: [{ createdAt: "desc" }],
      select: venueSelect,
    });
    return venues.map((v) => this.toVenueResponse(v as SelectedVenue));
  }

  async setVenueStatus(id: string, status: VenueStatus) {
    if (!Object.values(VenueStatus).includes(status))
      throw new BadRequestException("Invalid status");
    const existing = await this.prisma.venue.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!existing) throw new NotFoundException("Venue not found");
    const venue = await this.prisma.venue.update({
      where: { id },
      data: { status },
      select: venueSelect,
    });
    return this.toVenueResponse(venue as SelectedVenue);
  }
}

export const venuesService = new VenuesService();

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const DEFAULT_OPEN_HOUR = 6;
const DEFAULT_CLOSE_HOUR = 22;
const TIMEZONE = "Asia/Jakarta";

export class AvailabilityService {
  constructor(private readonly prisma: PrismaService = defaultPrisma) {}

  async getVenueAvailability(
    venueId: string,
    dateStr: string,
    courtId?: string,
  ) {
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

    const dayIdx = new Date(`${dateStr}T12:00:00Z`).getUTCDay();
    const key = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"][dayIdx];

    let startHour = this.parseOperatingHour(venue.openTime, DEFAULT_OPEN_HOUR);
    let endHour = this.parseOperatingHour(venue.closeTime, DEFAULT_CLOSE_HOUR);
    let isClosed = false;

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
        isClosed = true;
      } else {
        if (entry.open)
          startHour = this.parseOperatingHour(entry.open, DEFAULT_OPEN_HOUR);
        if (entry.close)
          endHour = this.parseOperatingHour(entry.close, DEFAULT_CLOSE_HOUR);
      }
    }

    const overnight = isOvernight(startHour, endHour);
    const totalHours = overnight
      ? 24 - startHour + endHour
      : endHour - startHour;

    if (!isClosed && totalHours <= 0) {
      isClosed = true;
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
        courts: courts.map((c) => ({
          id: c.id,
          name: c.name,
          type: c.type,
          slots: [],
        })),
      };
    }

    const bookingDate = new Date(`${dateStr}T00:00:00.000Z`);
    const sessionStartUtc = wibToUtc(
      dateStr,
      `${String(startHour).padStart(2, "0")}:00`,
    );
    const dayStart = sessionStartUtc;
    const dayEnd = new Date(sessionStartUtc.getTime() + totalHours * 3600000);

    const courtIds = courts.map((c) => c.id);

    const bookings = await this.prisma.booking.findMany({
      where: {
        venueId,
        courtId: { in: courtIds },
        bookingDate,
        status: {
          in: [BookingStatus.PENDING_PAYMENT, BookingStatus.CONFIRMED],
        },
        startsAt: { lt: dayEnd },
        endsAt: { gt: dayStart },
      },
      select: {
        courtId: true,
        startsAt: true,
        endsAt: true,
      },
    });

    const courtDtos = courts.map((court) => {
      const courtBookings = bookings.filter((b) => b.courtId === court.id);
      const slots = this.generateSlots(
        court,
        sessionStartUtc,
        totalHours,
        courtBookings,
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
    sessionStartUtc: Date,
    totalHours: number,
    bookings: { courtId: string; startsAt: Date; endsAt: Date }[],
  ) {
    const slots = [];

    for (let i = 0; i < totalHours; i++) {
      const slotStart = new Date(sessionStartUtc.getTime() + i * 3600000);
      const slotEnd = new Date(slotStart.getTime() + 3600000);

      const wibHour = wibHourFromUtc(slotStart);
      const wibDate = utcToWibDateStr(slotStart);
      const isWeekend = isWeekendWib(wibDate);
      const price = getSlotPrice(court, wibHour, isWeekend);

      const startsAt = `${String(wibHour).padStart(2, "0")}:00`;
      const endsAt = `${String((wibHour + 1) % 24).padStart(2, "0")}:00`;

      const available = !bookings.some(
        (b) => b.startsAt < slotEnd && b.endsAt > slotStart,
      );

      slots.push({
        startsAt,
        endsAt,
        available,
        price,
        isPeak: isPeakHour(wibHour, isWeekend),
      });
    }

    return slots;
  }
}

export const availabilityService = new AvailabilityService();
