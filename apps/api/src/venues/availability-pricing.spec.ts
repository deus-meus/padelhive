import { AvailabilityService } from "./availability.service";
import { PrismaService } from "../prisma/prisma.service";
import { VenueStatus, CourtType } from "@prisma/client";

describe("Availability Pricing", () => {
  let service: AvailabilityService;
  let prisma: PrismaService;

  beforeEach(() => {
    prisma = {
      venue: {
        findFirst: jest.fn().mockResolvedValue({
          id: "venue-1",
          openTime: "06:00",
          closeTime: "24:00",
          status: VenueStatus.APPROVED,
        }),
      },
      court: {
        findMany: jest.fn().mockResolvedValue([
          {
            id: "court-1",
            name: "Court A",
            type: CourtType.OUTDOOR,
            isActive: true,
            weekdayPeak: 300000,
            weekdayOffPeak: 200000,
            weekendPeak: 400000,
            weekendOffPeak: 250000,
          },
        ]),
      },
      booking: {
        findMany: jest.fn().mockResolvedValue([]),
      },
    } as unknown as PrismaService;

    service = new AvailabilityService(prisma);
  });

  it("classifies and prices weekday slots correctly across UTC boundary", async () => {
    // 2099-06-01 is a Monday
    const result = await service.getVenueAvailability("venue-1", "2099-06-01", "court-1");
    
    // 18:00 WIB
    const slot18 = result.courts[0].slots.find((s) => s.startsAt === "18:00");
    expect(slot18).toBeDefined();
    expect(slot18!.isPeak).toBe(true);
    expect(slot18!.price).toBe(300000);

    // 23:00 WIB (16:00 UTC)
    const slot23 = result.courts[0].slots.find((s) => s.startsAt === "23:00");
    expect(slot23).toBeDefined();
    expect(slot23!.isPeak).toBe(false);
    expect(slot23!.price).toBe(200000);
  });

  it("classifies and prices weekend slots correctly", async () => {
    // 2099-06-06 is a Saturday
    const result = await service.getVenueAvailability("venue-1", "2099-06-06", "court-1");

    // 08:00 WIB is Weekend Peak
    const slot08 = result.courts[0].slots.find((s) => s.startsAt === "08:00");
    expect(slot08!.isPeak).toBe(true);
    expect(slot08!.price).toBe(400000);

    // 14:00 WIB is Weekend Off-Peak
    const slot14 = result.courts[0].slots.find((s) => s.startsAt === "14:00");
    expect(slot14!.isPeak).toBe(false);
    expect(slot14!.price).toBe(250000);
  });
});
