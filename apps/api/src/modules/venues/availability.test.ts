import { beforeEach, describe, expect, it, mock } from "bun:test";
import { CourtType, VenueStatus } from "@prisma/client";
import type { PrismaService } from "../../common/prisma";
import { AvailabilityService } from "./service";

describe("Availability Pricing", () => {
  let service: AvailabilityService;
  let prisma: PrismaService;

  beforeEach(() => {
    prisma = {
      venue: {
        findFirst: mock().mockResolvedValue({
          id: "venue-1",
          openTime: "06:00",
          closeTime: "24:00",
          status: VenueStatus.APPROVED,
        }),
      },
      court: {
        findMany: mock().mockResolvedValue([
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
        findMany: mock().mockResolvedValue([]),
      },
    } as unknown as PrismaService;

    service = new AvailabilityService(prisma);
  });

  it("classifies and prices weekday slots correctly across UTC boundary", async () => {
    const result = await service.getVenueAvailability(
      "venue-1",
      "2099-06-01",
      "court-1",
    );

    const slot18 = result.courts[0].slots.find((s) => s.startsAt === "18:00");
    expect(slot18).toBeDefined();
    expect(slot18!.isPeak).toBe(true);
    expect(slot18!.price).toBe(300000);

    const slot23 = result.courts[0].slots.find((s) => s.startsAt === "23:00");
    expect(slot23).toBeDefined();
    expect(slot23!.isPeak).toBe(false);
    expect(slot23!.price).toBe(200000);
  });

  it("classifies and prices weekend slots correctly", async () => {
    const result = await service.getVenueAvailability(
      "venue-1",
      "2099-06-06",
      "court-1",
    );

    const slot08 = result.courts[0].slots.find((s) => s.startsAt === "08:00");
    expect(slot08!.isPeak).toBe(true);
    expect(slot08!.price).toBe(400000);

    const slot14 = result.courts[0].slots.find((s) => s.startsAt === "14:00");
    expect(slot14!.isPeak).toBe(false);
    expect(slot14!.price).toBe(250000);
  });
});
