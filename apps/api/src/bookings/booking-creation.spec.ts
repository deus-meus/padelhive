import { BadRequestException, ConflictException, NotFoundException } from "@nestjs/common";
import { BookingStatus, CourtType, UserRole, VenueStatus } from "@prisma/client";
import { FirebaseAuthGuard } from "../auth/guards/firebase-auth.guard";
import { RequestUser } from "../auth/types/request-user.type";
import { BookingsController } from "./bookings.controller";
import { BookingsService } from "./bookings.service";

const requestUser: RequestUser = {
  id: "user-1",
  firebaseUid: "firebase-1",
  email: "player@padelhive.com",
  name: "Player One",
  role: UserRole.PLAYER,
};

const approvedVenue = { id: "venue-1", name: "Padel Bali", city: "Bali", status: VenueStatus.APPROVED };
const activeCourt = {
  id: "court-1",
  venueId: "venue-1",
  name: "Court A",
  type: CourtType.OUTDOOR,
  isActive: true,
  weekdayPeak: 300000,
  weekdayOffPeak: 200000,
  weekendPeak: 400000,
  weekendOffPeak: 250000,
};

function createPrisma(overrides: Record<string, unknown> = {}) {
  return {
    venue: { findFirst: jest.fn().mockResolvedValue(approvedVenue) },
    court: { findFirst: jest.fn().mockResolvedValue(activeCourt) },
    booking: {
      findFirst: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue({
        id: "booking-1",
        bookingDate: new Date("2099-06-01T00:00:00.000Z"),
        startsAt: new Date("2099-06-01T09:00:00.000Z"),
        endsAt: new Date("2099-06-01T11:00:00.000Z"),
        durationMinutes: 120,
        status: BookingStatus.PENDING_PAYMENT,
        courtAmount: 600000,
        platformFee: 30000,
        voucherDiscount: 0,
        finalAmount: 630000,
        venue: { id: "venue-1", name: "Padel Bali", city: "Bali" },
        court: { id: "court-1", name: "Court A", type: CourtType.OUTDOOR },
        host: { id: "user-1", name: "Player One", email: "player@padelhive.com" },
      }),
    },
    ...overrides,
  };
}

describe("Booking creation API", () => {
  it("protects POST /bookings with FirebaseAuthGuard", () => {
    const guards = Reflect.getMetadata("__guards__", BookingsController.prototype.create) ??[];
    expect(guards).toContain(FirebaseAuthGuard);
  });

  it("uses current user as booking host in controller", async () => {
    const service = { createBookingForUser: jest.fn().mockResolvedValue({ id: "booking-1" }) } as unknown as BookingsService;
    const controller = new BookingsController(service);
    const body = { venueId: "venue-1", courtId: "court-1", bookingDate: "2099-06-01", startsAt: "09:00", endsAt: "11:00" };

    await expect(controller.create(body, requestUser)).resolves.toEqual({ id: "booking-1" });
    expect(service.createBookingForUser).toHaveBeenCalledWith("user-1", body);
  });

  it("creates a pending-payment booking with server-side pricing", async () => {
    const prisma = createPrisma();
    const service = new BookingsService(prisma as never);

    await service.createBookingForUser("user-1", {
      venueId: "venue-1",
      courtId: "court-1",
      bookingDate: "2099-06-01",
      startsAt: "09:00",
      endsAt: "11:00",
      amount: 1,
    } as never);

    expect(prisma.venue.findFirst).toHaveBeenCalledWith({
      where: { id: "venue-1", status: VenueStatus.APPROVED },
      select: { id: true, name: true, city: true, status: true },
    });
    expect(prisma.court.findFirst).toHaveBeenCalledWith({
      where: { id: "court-1", venueId: "venue-1", isActive: true },
      select: expect.objectContaining({ weekdayPeak: true, weekdayOffPeak: true, weekendPeak: true, weekendOffPeak: true }),
    });
    expect(prisma.booking.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        hostUserId: "user-1",
        venueId: "venue-1",
        courtId: "court-1",
        status: BookingStatus.PENDING_PAYMENT,
        durationMinutes: 120,
        courtAmount: 600000,
        platformFee: 30000,
        voucherDiscount: 0,
        finalAmount: 630000,
      }),
      select: expect.any(Object),
    });
  });

  it("rejects missing or non-approved venue", async () => {
    const prisma = createPrisma({ venue: { findFirst: jest.fn().mockResolvedValue(null) } });
    const service = new BookingsService(prisma as never);

    await expect(service.createBookingForUser("user-1", {
      venueId: "venue-pending",
      courtId: "court-1",
      bookingDate: "2099-06-01",
      startsAt: "09:00",
      endsAt: "10:00",
    })).rejects.toThrow(NotFoundException);
  });

  it("rejects inactive or wrong-venue court", async () => {
    const prisma = createPrisma({ court: { findFirst: jest.fn().mockResolvedValue(null) } });
    const service = new BookingsService(prisma as never);

    await expect(service.createBookingForUser("user-1", {
      venueId: "venue-1",
      courtId: "court-inactive",
      bookingDate: "2099-06-01",
      startsAt: "09:00",
      endsAt: "10:00",
    })).rejects.toThrow(NotFoundException);
  });

  it("rejects invalid dates and non-whole-hour times", async () => {
    const service = new BookingsService(createPrisma() as never);

    await expect(service.createBookingForUser("user-1", { venueId: "venue-1", courtId: "court-1", bookingDate: "2099-02-31", startsAt: "09:00", endsAt: "10:00" })).rejects.toThrow(BadRequestException);
    await expect(service.createBookingForUser("user-1", { venueId: "venue-1", courtId: "court-1", bookingDate: "2099-06-01", startsAt: "09:30", endsAt: "10:00" })).rejects.toThrow(BadRequestException);
    await expect(service.createBookingForUser("user-1", { venueId: "venue-1", courtId: "court-1", bookingDate: "2099-06-01", startsAt: "11:00", endsAt: "10:00" })).rejects.toThrow(BadRequestException);
  });

  it("rejects past booking starts", async () => {
    const service = new BookingsService(createPrisma() as never);

    await expect(service.createBookingForUser("user-1", {
      venueId: "venue-1",
      courtId: "court-1",
      bookingDate: "2000-01-01",
      startsAt: "09:00",
      endsAt: "10:00",
    })).rejects.toThrow(BadRequestException);
  });

  it("rejects overlapping pending-payment or confirmed bookings", async () => {
    const prisma = createPrisma({ booking: { findFirst: jest.fn().mockResolvedValue({ id: "booking-existing" }), create: jest.fn() } });
    const service = new BookingsService(prisma as never);

    await expect(service.createBookingForUser("user-1", {
      venueId: "venue-1",
      courtId: "court-1",
      bookingDate: "2099-06-01",
      startsAt: "09:00",
      endsAt: "10:00",
    })).rejects.toThrow(ConflictException);

    expect(prisma.booking.findFirst).toHaveBeenCalledWith({
      where: {
        courtId: "court-1",
        status: { in: [BookingStatus.PENDING_PAYMENT, BookingStatus.CONFIRMED] },
        startsAt: { lt: new Date("2099-06-01T10:00:00.000Z") },
        endsAt: { gt: new Date("2099-06-01T09:00:00.000Z") },
      },
      select: { id: true },
    });
    expect(prisma.booking.create).not.toHaveBeenCalled();
  });
});
