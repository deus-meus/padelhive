import { Injectable, NotFoundException } from "@nestjs/common";
import { VenueStatus } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { CourtResponseDto } from "./dto/court-response.dto";

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
}
