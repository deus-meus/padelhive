import { NotFoundException } from "@nestjs/common";
import { BookingStatus, CourtType, UserRole, VenueStatus, VoucherType } from "@prisma/client";
import { FirebaseAuthGuard } from "./auth/guards/firebase-auth.guard";
import { RequestUser } from "./auth/types/request-user.type";
import { BookingsController } from "./bookings/bookings.controller";
import { BookingsService } from "./bookings/bookings.service";
import { CourtsController } from "./courts/courts.controller";
import { CourtsService } from "./courts/courts.service";
import { VenuesController } from "./venues/venues.controller";
import { VenuesService } from "./venues/venues.service";
import { AvailabilityService } from "./venues/availability.service";
import { VouchersController } from "./vouchers/vouchers.controller";
import { VouchersService } from "./vouchers/vouchers.service";

describe("Read-only venues API", () => {
  it("queries approved venues only for venue list", async () => {
    const prisma = { venue: { findMany: jest.fn().mockResolvedValue([]) } };
    const service = new VenuesService(prisma as never);

    await service.findApprovedVenues();

    expect(prisma.venue.findMany).toHaveBeenCalledWith({
      where: { status: VenueStatus.APPROVED },
      orderBy: [{ city: "asc" }, { name: "asc" }],
      select: {
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
      },
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
    };
    const prisma = { venue: { findFirst: jest.fn().mockResolvedValue(venue) } };
    const service = new VenuesService(prisma as never);

    await expect(service.findApprovedVenueById("venue-1")).resolves.toEqual({ ...venue, rating: 4.75 });
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

describe("Read-only bookings API", () => {
  const requestUser: RequestUser = {
    id: "user-1",
    firebaseUid: "firebase-1",
    email: "player@padelhive.com",
    name: "Player One",
    role: UserRole.PLAYER,
  };

  it("queries booking by id and current host user", async () => {
    const prisma = {
      booking: {
        findFirst: jest.fn().mockResolvedValue({
          id: "booking-1",
          bookingDate: new Date("2026-06-01T00:00:00.000Z"),
          startsAt: new Date("2026-06-01T10:00:00.000Z"),
          endsAt: new Date("2026-06-01T11:00:00.000Z"),
          durationMinutes: 60,
          status: BookingStatus.CONFIRMED,
          courtAmount: 300000,
          platformFee: 15000,
          voucherDiscount: 0,
          finalAmount: 315000,
          venue: { id: "venue-1", name: "Venue", city: "Bali" },
          court: { id: "court-1", name: "Court 1", type: CourtType.INDOOR },
          host: { id: "user-1", name: "Player One", email: "player@padelhive.com" },
        }),
      },
    };
    const service = new BookingsService(prisma as never);

    await service.findBookingForUser("booking-1", "user-1");

    expect(prisma.booking.findFirst).toHaveBeenCalledWith({
      where: { id: "booking-1", hostUserId: "user-1" },
      select: expect.objectContaining({
        id: true,
        venue: { select: { id: true, name: true, city: true } },
        court: { select: { id: true, name: true, type: true } },
        host: { select: { id: true, name: true, email: true } },
      }),
    });
  });

  it("returns 404 when booking is missing or belongs to another user", async () => {
    const prisma = { booking: { findFirst: jest.fn().mockResolvedValue(null) } };
    const service = new BookingsService(prisma as never);

    await expect(service.findBookingForUser("booking-2", "user-1")).rejects.toThrow(NotFoundException);
  });

  it("protects booking controller with FirebaseAuthGuard", () => {
    const guards = Reflect.getMetadata("__guards__", BookingsController.prototype.findOne) ??[];
    expect(guards).toContain(FirebaseAuthGuard);
  });

  it("returns current user's booking from controller", async () => {
    const booking = { id: "booking-1" };
    const service = { findBookingForUser: jest.fn().mockResolvedValue(booking) } as unknown as BookingsService;
    const controller = new BookingsController(service);

    await expect(controller.findOne("booking-1", requestUser)).resolves.toEqual(booking);
    expect(service.findBookingForUser).toHaveBeenCalledWith("booking-1", "user-1");
  });
});

describe("Read-only vouchers API", () => {
  it("queries active currently valid vouchers only", async () => {
    const prisma = { voucher: { findMany: jest.fn().mockResolvedValue([]) } };
    const service = new VouchersService(prisma as never);
    const now = new Date("2026-05-31T12:00:00.000Z");

    await service.findActiveVouchers(now);

    expect(prisma.voucher.findMany).toHaveBeenCalledWith({
      where: { isActive: true, validFrom: { lte: now }, validUntil: { gte: now } },
      orderBy: { validUntil: "asc" },
      select: {
        id: true,
        code: true,
        type: true,
        value: true,
        minPurchase: true,
        maxDiscount: true,
        usageLimit: true,
        usedCount: true,
        validFrom: true,
        validUntil: true,
        isActive: true,
      },
    });
  });

  it("omits exhausted vouchers after querying active valid vouchers", async () => {
    const validVoucher = { id: "voucher-1", code: "WELCOME10", type: VoucherType.PERCENTAGE, value: 10, minPurchase: null, maxDiscount: 50000, usageLimit: 100, usedCount: 99, validFrom: new Date("2026-05-01T00:00:00.000Z"), validUntil: new Date("2026-06-01T00:00:00.000Z"), isActive: true };
    const exhaustedVoucher = { ...validVoucher, id: "voucher-2", code: "USEDUP", usedCount: 100 };
    const prisma = { voucher: { findMany: jest.fn().mockResolvedValue([validVoucher, exhaustedVoucher]) } };
    const service = new VouchersService(prisma as never);

    await expect(service.findActiveVouchers(new Date("2026-05-31T12:00:00.000Z"))).resolves.toEqual([validVoucher]);
  });

  it("exposes vouchers controller route", async () => {
    const vouchers = [{ id: "voucher-1", code: "WELCOME10", type: VoucherType.PERCENTAGE, value: 10, minPurchase: null, maxDiscount: 50000, usageLimit: 100, usedCount: 0, validFrom: new Date("2026-05-01T00:00:00.000Z"), validUntil: new Date("2026-06-01T00:00:00.000Z"), isActive: true }];
    const service = { findActiveVouchers: jest.fn().mockResolvedValue(vouchers) } as unknown as VouchersService;
    const controller = new VouchersController(service);

    await expect(controller.findAll()).resolves.toEqual(vouchers);
  });
});
