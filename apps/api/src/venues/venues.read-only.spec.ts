import { NotFoundException } from "@nestjs/common";
import { VenueStatus } from "@prisma/client";
import { VenuesController } from "./venues.controller";
import { VenuesService } from "./venues.service";
import { AvailabilityService } from "./availability.service";

describe("Read-only venues API", () => {
  it("queries approved venues only for venue list", async () => {
    const prisma = { venue: { findMany: jest.fn().mockResolvedValue([]) } };
    const service = new VenuesService(prisma as never);

    await service.findApprovedVenues();

    expect(prisma.venue.findMany).toHaveBeenCalledWith({
      where: { status: VenueStatus.APPROVED },
      orderBy: [{ city: "asc" }, { name: "asc" }],
      select: expect.any(Object),
    });
  });

  it("returns approved venue details", async () => {
    const venue = {
      id: "venue-1",
      name: "Bali Padel Club",
      slug: "bali-padel-club",
      location: "Canggu",
      city: "Bali",
      description: "Premium courts",
      imageUrl: null,
      photos: [],
      facilities: ["Parking"],
      openTime: "06:00",
      closeTime: "22:00",
      rating: { toNumber: () => 4.75 },
      reviewCount: 12,
      status: VenueStatus.APPROVED,
      courts: [],
      _count: { courts: 2 },
    };
    const prisma = { venue: { findFirst: jest.fn().mockResolvedValue(venue) } };
    const service = new VenuesService(prisma as never);

    const { courts, _count, ...expectedVenue } = venue;
    await expect(service.findApprovedVenueById("venue-1")).resolves.toEqual({ 
      ...expectedVenue, 
      rating: 4.75,
      courtCount: 2,
      priceFrom: 0,
      weeklyHours: null,
    });
    expect(prisma.venue.findFirst).toHaveBeenCalledWith({
      where: { id: "venue-1", status: VenueStatus.APPROVED },
      select: expect.any(Object),
    });
  });

  it("returns 404 for missing or non-approved venue detail", async () => {
    const prisma = { venue: { findFirst: jest.fn().mockResolvedValue(null) } };
    const service = new VenuesService(prisma as never);

    await expect(service.findApprovedVenueById("venue-pending")).rejects.toThrow(NotFoundException);
  });

  it("exposes venue controller routes", async () => {
    const service = {
      findApprovedVenues: jest.fn().mockResolvedValue([]),
      findApprovedVenueById: jest.fn().mockResolvedValue({ id: "venue-1" }),
    } as unknown as VenuesService;
    const availabilityService = { getVenueAvailability: jest.fn() } as unknown as AvailabilityService;
    const controller = new VenuesController(service, availabilityService);

    await expect(controller.findAll()).resolves.toEqual([]);
    await expect(controller.findOne("venue-1")).resolves.toEqual({ id: "venue-1" });
  });
});
