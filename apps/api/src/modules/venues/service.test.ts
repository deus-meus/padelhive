import { NotFoundException } from "../../common/errors";
import { VenueStatus } from "@prisma/client";
import { VenuesService } from "./service";

describe("VenuesService", () => {
  it("queries approved venues only for venue list", async () => {
    const prisma = { venue: { findMany: jest.fn().mockResolvedValue([]) } };
    const notifications = { createNotification: jest.fn() };
    const service = new VenuesService(prisma as never, notifications as never);

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
      location: "Seminyak",
      city: "Bali",
      description: "Top club",
      imageUrl: null,
      photos: [],
      facilities: ["Parking"],
      openTime: "06:00",
      closeTime: "22:00",
      weeklyHours: null,
      rating: 4.8,
      reviewCount: 10,
      status: VenueStatus.APPROVED,
      courts: [{ weekdayOffPeak: 200000 }, { weekdayOffPeak: 300000 }],
      _count: { courts: 2 },
    };

    const prisma = {
      venue: {
        findFirst: jest.fn().mockResolvedValue(venue),
      },
    };
    const notifications = { createNotification: jest.fn() };
    const service = new VenuesService(prisma as never, notifications as never);

    const result = await service.findApprovedVenueById("venue-1");

    expect(result).toEqual({
      id: "venue-1",
      name: "Bali Padel Club",
      slug: "bali-padel-club",
      location: "Seminyak",
      city: "Bali",
      description: "Top club",
      imageUrl: null,
      photos: [],
      facilities: ["Parking"],
      openTime: "06:00",
      closeTime: "22:00",
      rating: 4.8,
      reviewCount: 10,
      status: VenueStatus.APPROVED,
      courtCount: 2,
      priceFrom: 200000,
      weeklyHours: null,
    });
    expect(prisma.venue.findFirst).toHaveBeenCalledWith({
      where: { id: "venue-1", status: VenueStatus.APPROVED },
      select: expect.any(Object),
    });
  });

  it("returns 404 for missing or non-approved venue detail", async () => {
    const prisma = { venue: { findFirst: jest.fn().mockResolvedValue(null) } };
    const notifications = { createNotification: jest.fn() };
    const service = new VenuesService(prisma as never, notifications as never);

    await expect(service.findApprovedVenueById("venue-pending")).rejects.toThrow(NotFoundException);
  });
});
