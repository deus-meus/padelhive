import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { CourtType, VenueStatus } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { CourtResponseDto } from "./dto/court-response.dto";
import { CreateCourtDto } from "./dto/create-court.dto";
import { UpdateCourtDto } from "./dto/update-court.dto";

@Injectable()
export class CourtsService {
  constructor(private readonly prisma: PrismaService) {}

  async findActiveCourtsForApprovedVenue(venueId: string): Promise<CourtResponseDto[]> {
    const venue = await this.prisma.venue.findFirst({
      where: { id: venueId, status: VenueStatus.APPROVED },
      select: { id: true },
    });

    if (!venue) {
      throw new NotFoundException("Venue not found");
    }

    return this.prisma.court.findMany({
      where: { venueId, isActive: true },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        type: true,
        weekdayPeak: true,
        weekdayOffPeak: true,
        weekendPeak: true,
        weekendOffPeak: true,
        isActive: true,
      },
    });
  }

  private async assertVenueManageable(venueId: string, userId: string, isSuperAdmin: boolean): Promise<void> {
    const venue = await this.prisma.venue.findUnique({
      where: { id: venueId },
      select: {
        id: true,
        ownerId: true,
        admins: {
          where: { userId },
          select: { id: true },
        },
      },
    });

    if (!venue) {
      throw new NotFoundException("Venue not found");
    }

    if (!isSuperAdmin && venue.ownerId !== userId && venue.admins.length === 0) {
      throw new ForbiddenException("You don't have access to this venue");
    }
  }

  private validateCourtFields(fields: Record<string, unknown>, { partial }: { partial: boolean }) {
    if (partial && Object.keys(fields).length === 0) {
      throw new BadRequestException("No fields to update");
    }

    if (!partial || fields.name !== undefined) {
      if (typeof fields.name !== "string" || fields.name.trim() === "") {
        throw new BadRequestException("Court name is required");
      }
    }

    if (!partial || fields.type !== undefined) {
      if (fields.type !== CourtType.INDOOR && fields.type !== CourtType.OUTDOOR) {
        throw new BadRequestException("Court type must be INDOOR or OUTDOOR");
      }
    }

    const priceFields = ["weekdayPeak", "weekdayOffPeak", "weekendPeak", "weekendOffPeak"];
    for (const field of priceFields) {
      if (!partial || fields[field] !== undefined) {
        if (!Number.isInteger(fields[field]) || (fields[field] as number) < 0) {
          throw new BadRequestException("Prices must be non-negative whole numbers");
        }
      }
    }

    if (fields.isActive !== undefined) {
      if (typeof fields.isActive !== "boolean") {
        throw new BadRequestException("isActive must be a boolean");
      }
    }
  }

  async findCourtsForManagement(venueId: string, userId: string, isSuperAdmin: boolean): Promise<CourtResponseDto[]> {
    await this.assertVenueManageable(venueId, userId, isSuperAdmin);

    return this.prisma.court.findMany({
      where: { venueId },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        type: true,
        weekdayPeak: true,
        weekdayOffPeak: true,
        weekendPeak: true,
        weekendOffPeak: true,
        isActive: true,
      },
    });
  }

  async createCourt(venueId: string, userId: string, isSuperAdmin: boolean, dto: CreateCourtDto): Promise<CourtResponseDto> {
    await this.assertVenueManageable(venueId, userId, isSuperAdmin);
    this.validateCourtFields(dto as unknown as Record<string, unknown>, { partial: false });

    try {
      return await this.prisma.court.create({
        data: {
          venueId,
          name: dto.name.trim(),
          type: dto.type,
          weekdayPeak: dto.weekdayPeak,
          weekdayOffPeak: dto.weekdayOffPeak,
          weekendPeak: dto.weekendPeak,
          weekendOffPeak: dto.weekendOffPeak,
          isActive: dto.isActive ?? true,
        },
        select: {
          id: true,
          name: true,
          type: true,
          weekdayPeak: true,
          weekdayOffPeak: true,
          weekendPeak: true,
          weekendOffPeak: true,
          isActive: true,
        },
      });
    } catch (error: unknown) {
      if ((error as { code?: string }).code === "P2002") {
        throw new ConflictException("A court with this name already exists in this venue");
      }
      throw error;
    }
  }

  async updateCourt(venueId: string, courtId: string, userId: string, isSuperAdmin: boolean, dto: UpdateCourtDto): Promise<CourtResponseDto> {
    await this.assertVenueManageable(venueId, userId, isSuperAdmin);
    
    // Convert DTO to plain object without undefined fields
    const fieldsToValidate = Object.fromEntries(
      Object.entries(dto).filter(([, v]) => v !== undefined)
    );
    this.validateCourtFields(fieldsToValidate, { partial: true });

    const court = await this.prisma.court.findFirst({
      where: { id: courtId, venueId },
      select: { id: true },
    });

    if (!court) {
      throw new NotFoundException("Court not found");
    }

    const data: Record<string, unknown> = {};
    if (dto.name !== undefined) data.name = dto.name.trim();
    if (dto.type !== undefined) data.type = dto.type;
    if (dto.weekdayPeak !== undefined) data.weekdayPeak = dto.weekdayPeak;
    if (dto.weekdayOffPeak !== undefined) data.weekdayOffPeak = dto.weekdayOffPeak;
    if (dto.weekendPeak !== undefined) data.weekendPeak = dto.weekendPeak;
    if (dto.weekendOffPeak !== undefined) data.weekendOffPeak = dto.weekendOffPeak;
    if (dto.isActive !== undefined) data.isActive = dto.isActive;

    try {
      return await this.prisma.court.update({
        where: { id: courtId },
        data,
        select: {
          id: true,
          name: true,
          type: true,
          weekdayPeak: true,
          weekdayOffPeak: true,
          weekendPeak: true,
          weekendOffPeak: true,
          isActive: true,
        },
      });
    } catch (error: unknown) {
      if ((error as { code?: string }).code === "P2002") {
        throw new ConflictException("A court with this name already exists in this venue");
      }
      throw error;
    }
  }
}
