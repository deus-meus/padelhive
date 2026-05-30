import { Injectable, NotFoundException } from "@nestjs/common";
import { VenueStatus } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { VenueResponseDto } from "./dto/venue-response.dto";

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
  rating: true,
  reviewCount: true,
  status: true,
};

type SelectedVenue = Omit<VenueResponseDto, "rating"> & {
  rating: { toNumber: () => number } | number;
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
    return {
      ...venue,
      rating: typeof venue.rating === "number" ? venue.rating : venue.rating.toNumber(),
    };
  }
}
