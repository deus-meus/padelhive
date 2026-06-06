import { NotFoundException } from "@nestjs/common";
import { CourtType, VenueStatus } from "@prisma/client";
import { CourtsController } from "./courts.controller";
import { CourtsService } from "./courts.service";

describe("Read-only courts API", () => {
  it("requires approved parent venue before listing active courts", async () => {
    const prisma = {
      venue: { findFirst: jest.fn().mockResolvedValue(null) },
      court: { findMany: jest.fn() },
    };
    const service = new CourtsService(prisma as never);

    await expect(service.findActiveCourtsForApprovedVenue("venue-pending")).rejects.toThrow(NotFoundException);
    expect(prisma.court.findMany).not.toHaveBeenCalled();
  });

  it("queries active courts only for approved venues", async () => {
    const prisma = {
      venue: { findFirst: jest.fn().mockResolvedValue({ id: "venue-1" }) },
      court: { findMany: jest.fn().mockResolvedValue([]) },
    };
    const service = new CourtsService(prisma as never);

    await service.findActiveCourtsForApprovedVenue("venue-1");

    expect(prisma.venue.findFirst).toHaveBeenCalledWith({
      where: { id: "venue-1", status: VenueStatus.APPROVED },
      select: { id: true },
    });
    expect(prisma.court.findMany).toHaveBeenCalledWith({
      where: { venueId: "venue-1", isActive: true },
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
  });

  it("exposes nested venue courts controller route", async () => {
    const courts = [{ id: "court-1", name: "Court 1", type: CourtType.INDOOR, weekdayPeak: 350000, weekdayOffPeak: 250000, weekendPeak: 450000, weekendOffPeak: 300000, isActive: true }];
    const service = { findActiveCourtsForApprovedVenue: jest.fn().mockResolvedValue(courts) } as unknown as CourtsService;
    const controller = new CourtsController(service);

    await expect(controller.findForVenue("venue-1")).resolves.toEqual(courts);
  });
});
