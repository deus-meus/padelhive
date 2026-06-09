import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma, VenueStatus } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { VenueResponseDto } from "./dto/venue-response.dto";
import { CreateVenueDto } from "./dto/create-venue.dto";
import { UpdateVenueDto } from "./dto/update-venue.dto";

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

type SelectedVenue = Omit<VenueResponseDto, "rating" | "courtCount" | "priceFrom" | "weeklyHours"> & {
  rating: { toNumber: () => number } | number;
  weeklyHours: Prisma.JsonValue | null;
  courts: { weekdayOffPeak: number }[];
  _count: { courts: number };
};

@Injectable()
export class VenuesService {
  constructor(private readonly prisma: PrismaService) {}

  async findApprovedVenues(): Promise<VenueResponseDto[]> {
    const venues = await this.prisma.venue.findMany({
      where: { status: VenueStatus.APPROVED },
      orderBy: [{ city: "asc" }, { name: "asc" }],
      select: venueSelect,
    });

    return venues.map((venue) => this.toVenueResponse(venue));
  }

  async findApprovedVenueById(id: string): Promise<VenueResponseDto> {
    const venue = await this.prisma.venue.findFirst({
      where: { id, status: VenueStatus.APPROVED },
      select: venueSelect,
    });

    if (!venue) {
      throw new NotFoundException("Venue not found");
    }

    return this.toVenueResponse(venue);
  }

  private toVenueResponse(venue: SelectedVenue): VenueResponseDto {
    const { courts, _count, ...rest } = venue;
    return {
      ...rest,
      weeklyHours: venue.weeklyHours ? (venue.weeklyHours as Record<string, { open: string; close: string; closed?: boolean }>) : null,
      rating: typeof venue.rating === "number" ? venue.rating : venue.rating.toNumber(),
      courtCount: _count.courts,
      priceFrom: courts.length > 0 ? Math.min(...courts.map(c => c.weekdayOffPeak)) : 0,
    };
  }

  private async assertVenueManageable(venueId: string, userId: string, isSuperAdmin: boolean): Promise<void> {
    const venue = await this.prisma.venue.findUnique({
      where: { id: venueId },
      select: { id: true, ownerId: true, admins: { where: { userId }, select: { id: true } } },
    });
    if (!venue) throw new NotFoundException("Venue not found");
    if (!isSuperAdmin && venue.ownerId !== userId && venue.admins.length === 0) {
      throw new ForbiddenException("You don't have access to this venue");
    }
  }

  private validateVenueFields(fields: Record<string, unknown>, { partial }: { partial: boolean }): void {
    if (partial && Object.keys(fields).length === 0) throw new BadRequestException("No fields to update");
    
    const stringFields = ["name", "location", "city", "description", "openTime", "closeTime"];
    for (const field of stringFields) {
      if (!partial || fields[field] !== undefined) {
        if (typeof fields[field] !== "string" || (fields[field] as string).trim() === "") {
          throw new BadRequestException(`${field} is required`);
        }
      }
    }

    if (fields.imageUrl !== undefined) {
      if (typeof fields.imageUrl !== "string") throw new BadRequestException("imageUrl must be a string");
    }

    const arrayFields = ["photos", "facilities"];
    for (const field of arrayFields) {
      if (fields[field] !== undefined) {
        if (!Array.isArray(fields[field]) || !fields[field].every(item => typeof item === "string")) {
          throw new BadRequestException(`${field} must be an array of strings`);
        }
      }
    }

    if (fields.weeklyHours !== undefined && fields.weeklyHours !== null) {
      if (typeof fields.weeklyHours !== "object" || Array.isArray(fields.weeklyHours)) {
        throw new BadRequestException("weeklyHours must be an object");
      }
      const validKeys = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
      for (const [key, val] of Object.entries(fields.weeklyHours as Record<string, unknown>)) {
        if (!validKeys.includes(key)) {
          throw new BadRequestException(`Unknown key in weeklyHours: ${key}`);
        }
        const value = val as { open?: string; close?: string; closed?: boolean };
        if (value.closed !== true) {
          if (typeof value.open !== "string" || !/^\d{2}:\d{2}$/.test(value.open)) {
            throw new BadRequestException("weeklyHours open must be HH:MM string");
          }
          if (typeof value.close !== "string" || !/^\d{2}:\d{2}$/.test(value.close)) {
            throw new BadRequestException("weeklyHours close must be HH:MM string");
          }
          if (value.close <= value.open) {
            throw new BadRequestException("weeklyHours close time must be after open time");
          }
        }
      }
    }
  }

  private async generateUniqueSlug(name: string): Promise<string> {
    const base = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "venue";
    let slug = base;
    let counter = 2;
    let isUnique = false;
    while (!isUnique) {
      const existing = await this.prisma.venue.findUnique({ where: { slug }, select: { id: true } });
      if (!existing) {
        isUnique = true;
        return slug;
      }
      slug = `${base}-${counter}`;
      counter++;
    }
    return slug;
  }

  async findVenuesForManagement(userId: string, isSuperAdmin: boolean): Promise<VenueResponseDto[]> {
    const where = isSuperAdmin ? {} : { OR: [{ ownerId: userId }, { admins: { some: { userId } } }] };
    const venues = await this.prisma.venue.findMany({
      where,
      orderBy: [{ createdAt: "desc" }],
      select: venueSelect,
    });
    return venues.map(v => this.toVenueResponse(v));
  }

  async createVenue(userId: string, dto: CreateVenueDto): Promise<VenueResponseDto> {
    this.validateVenueFields(dto as unknown as Record<string, unknown>, { partial: false });
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
          weeklyHours: dto.weeklyHours ? (dto.weeklyHours as Prisma.InputJsonValue) : Prisma.JsonNull,
        },
        select: venueSelect,
      });
      return this.toVenueResponse(venue);
    } catch (error: unknown) {
      if (error && typeof error === "object" && "code" in error && (error as { code?: string }).code === "P2002") {
        throw new ConflictException("A venue with this name already exists");
      }
      throw error;
    }
  }

  async updateVenue(id: string, userId: string, isSuperAdmin: boolean, dto: UpdateVenueDto): Promise<VenueResponseDto> {
    await this.assertVenueManageable(id, userId, isSuperAdmin);
    
    const fieldsToValidate = Object.fromEntries(Object.entries(dto).filter(([, v]) => v !== undefined));
    this.validateVenueFields(fieldsToValidate, { partial: true });

    const data: Prisma.VenueUpdateInput = {};
    if (dto.name !== undefined) data.name = dto.name.trim();
    if (dto.location !== undefined) data.location = dto.location.trim();
    if (dto.city !== undefined) data.city = dto.city.trim();
    if (dto.description !== undefined) data.description = dto.description.trim();
    if (dto.imageUrl !== undefined) data.imageUrl = dto.imageUrl.trim() || null;
    if (dto.photos !== undefined) data.photos = dto.photos;
    if (dto.facilities !== undefined) data.facilities = dto.facilities;
    if (dto.openTime !== undefined) data.openTime = dto.openTime.trim();
    if (dto.closeTime !== undefined) data.closeTime = dto.closeTime.trim();
    if (dto.weeklyHours !== undefined) {
      data.weeklyHours = dto.weeklyHours === null ? Prisma.JsonNull : (dto.weeklyHours as Prisma.InputJsonValue);
    }

    try {
      const venue = await this.prisma.venue.update({
        where: { id },
        data,
        select: venueSelect,
      });
      return this.toVenueResponse(venue);
    } catch (error: unknown) {
      if (error && typeof error === "object" && "code" in error && (error as { code?: string }).code === "P2002") {
        throw new ConflictException("A venue with this name already exists");
      }
      throw error;
    }
  }

  async findVenuesForAdmin(status?: VenueStatus): Promise<VenueResponseDto[]> {
    const where: Prisma.VenueWhereInput = status && Object.values(VenueStatus).includes(status) ? { status } : {};
    const venues = await this.prisma.venue.findMany({
      where,
      orderBy: [{ createdAt: "desc" }],
      select: venueSelect,
    });
    return venues.map(v => this.toVenueResponse(v));
  }

  async setVenueStatus(id: string, status: VenueStatus): Promise<VenueResponseDto> {
    if (!Object.values(VenueStatus).includes(status)) throw new BadRequestException("Invalid status");
    const existing = await this.prisma.venue.findUnique({ where: { id }, select: { id: true } });
    if (!existing) throw new NotFoundException("Venue not found");
    const venue = await this.prisma.venue.update({
      where: { id },
      data: { status },
      select: venueSelect,
    });
    return this.toVenueResponse(venue);
  }
}
