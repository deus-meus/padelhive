import { BadRequestException, ConflictException, NotFoundException } from "@nestjs/common";
import { BookingStatus, CourtType, PaymentStatus, RefundStatus, UserRole, VenueStatus } from "@prisma/client";
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

const cancellableBooking = {
  id: "booking-1",
  bookingDate: new Date("2099-06-01T00:00:00.000Z"),
  startsAt: new Date("2099-06-01T02:00:00.000Z"),
  endsAt: new Date("2099-06-01T04:00:00.000Z"),
  durationMinutes: 120,
  status: BookingStatus.CONFIRMED,
  courtAmount: 400000,
  platformFee: 20000,
  voucherDiscount: 0,
  finalAmount: 420000,
  cancelledAt: null,
  venue: { id: "venue-1", name: "Padel Bali", city: "Bali" },
  court: { id: "court-1", name: "Court A", type: CourtType.OUTDOOR },
  host: { id: "user-1", name: "Player One", email: "player@padelhive.com" },
  payment: {
    id: "payment-1",
    amount: 420000,
    status: PaymentStatus.PAID,
  },
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
        startsAt: new Date("2099-06-01T02:00:00.000Z"),
        endsAt: new Date("2099-06-01T04:00:00.000Z"),
        durationMinutes: 120,
        status: BookingStatus.PENDING_PAYMENT,
        courtAmount: 400000,
        platformFee: 20000,
        voucherDiscount: 0,
        finalAmount: 420000,
        venue: { id: "venue-1", name: "Padel Bali", city: "Bali" },
        court: { id: "court-1", name: "Court A", type: CourtType.OUTDOOR },
        host: { id: "user-1", name: "Player One", email: "player@padelhive.com" },
      }),
      update: jest.fn().mockResolvedValue({ ...cancellableBooking, status: BookingStatus.CANCELLED }),
    },
    refund: { create: jest.fn().mockResolvedValue({ id: "refund-1" }) },
    $transaction: jest.fn(async (callback) => callback({
      booking: { update: jest.fn().mockResolvedValue({ ...cancellableBooking, status: BookingStatus.CANCELLED }) },
      refund: { create: jest.fn().mockResolvedValue({ id: "refund-1" }) },
    })),
    ...overrides,
  };
}

describe("Booking creation API", () => {
  it("uses current user as booking host in controller", async () => {
    const service = { createBookingForUser: jest.fn().mockResolvedValue({ id: "booking-1" }) } as unknown as BookingsService;
    const controller = new BookingsController(service);
    const body = { venueId: "venue-1", courtId: "court-1", bookingDate: "2099-06-01", startsAt: "09:00", endsAt: "11:00" };

    await expect(controller.create(body, requestUser)).resolves.toEqual({ id: "booking-1" });
    expect(service.createBookingForUser).toHaveBeenCalledWith("user-1", body);
  });

  it("uses current user when cancelling in controller", async () => {
    const service = { cancelBookingForUser: jest.fn().mockResolvedValue({ id: "booking-1", status: BookingStatus.CANCELLED }) } as unknown as BookingsService;
    const controller = new BookingsController(service);

    await expect(controller.cancel("booking-1", requestUser)).resolves.toEqual({ id: "booking-1", status: BookingStatus.CANCELLED });
    expect(service.cancelBookingForUser).toHaveBeenCalledWith("booking-1", "user-1");
  });

  it("creates a pending-payment booking with server-side pricing", async () => {
    const prisma = createPrisma();
    const service = new BookingsService(prisma as never, {} as never);

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
        courtAmount: 400000,
        platformFee: 20000,
        voucherDiscount: 0,
        finalAmount: 420000,
        expiresAt: expect.any(Date),
      }),
      select: expect.any(Object),
    });
  });

  it("rejects missing or non-approved venue", async () => {
    const prisma = createPrisma({ venue: { findFirst: jest.fn().mockResolvedValue(null) } });
    const service = new BookingsService(prisma as never, {} as never);

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
    const service = new BookingsService(prisma as never, {} as never);

    await expect(service.createBookingForUser("user-1", {
      venueId: "venue-1",
      courtId: "court-inactive",
      bookingDate: "2099-06-01",
      startsAt: "09:00",
      endsAt: "10:00",
    })).rejects.toThrow(NotFoundException);
  });

  it("rejects invalid dates and non-whole-hour times", async () => {
    const service = new BookingsService(createPrisma() as never, {} as never);

    await expect(service.createBookingForUser("user-1", { venueId: "venue-1", courtId: "court-1", bookingDate: "2099-02-31", startsAt: "09:00", endsAt: "10:00" })).rejects.toThrow(BadRequestException);
    await expect(service.createBookingForUser("user-1", { venueId: "venue-1", courtId: "court-1", bookingDate: "2099-06-01", startsAt: "09:30", endsAt: "10:00" })).rejects.toThrow(BadRequestException);
    await expect(service.createBookingForUser("user-1", { venueId: "venue-1", courtId: "court-1", bookingDate: "2099-06-01", startsAt: "11:00", endsAt: "10:00" })).rejects.toThrow(BadRequestException);
  });

  it("rejects past booking starts", async () => {
    const service = new BookingsService(createPrisma() as never, {} as never);

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
    const service = new BookingsService(prisma as never, {} as never);

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
        startsAt: { lt: new Date("2099-06-01T03:00:00.000Z") },
        endsAt: { gt: new Date("2099-06-01T02:00:00.000Z") },
      },
      select: { id: true },
    });
    expect(prisma.booking.create).not.toHaveBeenCalled();
  });

  it("lets the owner cancel and creates pending refund for paid eligible bookings", async () => {
    const txBookingUpdate = jest.fn().mockResolvedValue({ ...cancellableBooking, status: BookingStatus.CANCELLED, cancelledAt: new Date("2099-05-31T02:00:00.000Z") });
    const txRefundCreate = jest.fn().mockResolvedValue({ id: "refund-1" });
    const prisma = createPrisma({
      booking: {
        findFirst: jest.fn().mockResolvedValue(cancellableBooking),
        create: jest.fn(),
        update: jest.fn(),
      },
      $transaction: jest.fn(async (callback) => callback({
        booking: { update: txBookingUpdate },
        refund: { create: txRefundCreate },
      })),
    });
    const service = new BookingsService(prisma as never, {} as never);
    const now = new Date("2099-05-31T02:00:00.000Z");

    const result = await service.cancelBookingForUser("booking-1", "user-1", now);

    expect(prisma.booking.findFirst).toHaveBeenCalledWith({
      where: { id: "booking-1", hostUserId: "user-1" },
      select: expect.any(Object),
    });
    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    expect(txBookingUpdate).toHaveBeenCalledWith({
      where: { id: "booking-1" },
      data: { status: BookingStatus.CANCELLED, cancelledAt: now },
      select: expect.any(Object),
    });
    expect(txRefundCreate).toHaveBeenCalledWith({
      data: {
        bookingId: "booking-1",
        paymentId: "payment-1",
        amount: 420000,
        reason: "Full refund eligible: cancelled at least 24 hours before booking start.",
        status: RefundStatus.PENDING,
      },
    });
    expect(result.status).toBe(BookingStatus.CANCELLED);
    expect(result.isRefundEligible).toBe(true);
    expect(result.refundAmount).toBe(420000);
  });

  it("rejects cancel for missing or non-owned bookings", async () => {
    const service = new BookingsService(createPrisma({
      booking: { findFirst: jest.fn().mockResolvedValue(null), create: jest.fn(), update: jest.fn() },
    }) as never, {} as never);

    await expect(service.cancelBookingForUser("booking-1", "user-2", new Date("2099-05-31T02:00:00.000Z"))).rejects.toThrow(NotFoundException);
  });

  it("rejects completed bookings", async () => {
    const service = new BookingsService(createPrisma({
      booking: { findFirst: jest.fn().mockResolvedValue({ ...cancellableBooking, status: BookingStatus.COMPLETED }), create: jest.fn(), update: jest.fn() },
    }) as never, {} as never);

    await expect(service.cancelBookingForUser("booking-1", "user-1", new Date("2099-05-31T02:00:00.000Z"))).rejects.toThrow(BadRequestException);
  });

  it("rejects already cancelled bookings", async () => {
    const service = new BookingsService(createPrisma({
      booking: { findFirst: jest.fn().mockResolvedValue({ ...cancellableBooking, status: BookingStatus.CANCELLED }), create: jest.fn(), update: jest.fn() },
    }) as never, {} as never);

    await expect(service.cancelBookingForUser("booking-1", "user-1", new Date("2099-05-31T02:00:00.000Z"))).rejects.toThrow(BadRequestException);
  });

  it("does not create refund when cancellation is less than 24 hours before start", async () => {
    const txRefundCreate = jest.fn();
    const prisma = createPrisma({
      booking: { findFirst: jest.fn().mockResolvedValue(cancellableBooking), create: jest.fn(), update: jest.fn() },
      $transaction: jest.fn(async (callback) => callback({
        booking: { update: jest.fn().mockResolvedValue({ ...cancellableBooking, status: BookingStatus.CANCELLED }) },
        refund: { create: txRefundCreate },
      })),
    });
    const service = new BookingsService(prisma as never, {} as never);

    const result = await service.cancelBookingForUser("booking-1", "user-1", new Date("2099-05-31T02:00:01.000Z"));

    expect(result.isRefundEligible).toBe(false);
    expect(result.refundAmount).toBe(0);
    expect(txRefundCreate).not.toHaveBeenCalled();
  });

  it("does not create refund when eligible booking has no paid payment", async () => {
    const txRefundCreate = jest.fn();
    const prisma = createPrisma({
      booking: {
        findFirst: jest.fn().mockResolvedValue({ ...cancellableBooking, payment: { ...cancellableBooking.payment, status: PaymentStatus.PENDING } }),
        create: jest.fn(),
        update: jest.fn(),
      },
      $transaction: jest.fn(async (callback) => callback({
        booking: { update: jest.fn().mockResolvedValue({ ...cancellableBooking, status: BookingStatus.CANCELLED }) },
        refund: { create: txRefundCreate },
      })),
    });
    const service = new BookingsService(prisma as never, {} as never);

    const result = await service.cancelBookingForUser("booking-1", "user-1", new Date("2099-05-31T02:00:00.000Z"));

    expect(result.isRefundEligible).toBe(true);
    expect(result.refundAmount).toBe(0);
    expect(txRefundCreate).not.toHaveBeenCalled();
  });

  it("prices correctly near weekend boundary and does not shift bookingDate off WIB day", async () => {
    const prisma = createPrisma();
    const service = new BookingsService(prisma as never, {} as never);

    await service.createBookingForUser("user-1", {
      venueId: "venue-1",
      courtId: "court-1",
      bookingDate: "2099-06-06",
      startsAt: "06:00",
      endsAt: "08:00",
      amount: 1,
    } as never);

    expect(prisma.booking.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        bookingDate: new Date("2099-06-06T00:00:00.000Z"),
        startsAt: new Date("2099-06-05T23:00:00.000Z"),
        endsAt: new Date("2099-06-06T01:00:00.000Z"),
        courtAmount: 500000,
        finalAmount: 525000,
      }),
      select: expect.any(Object),
    });
  });

  it("translates database exclusion constraint violation to 409 ConflictException", async () => {
    const prisma = createPrisma({
      booking: {
        findFirst: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockRejectedValue({
          code: "P2010",
          message: "Raw query failed. SQLSTATE 23P01 booking_no_overlap",
        }),
      },
    });
    const service = new BookingsService(prisma as never, {} as never);

    await expect(service.createBookingForUser("user-1", {
      venueId: "venue-1",
      courtId: "court-1",
      bookingDate: "2099-06-01",
      startsAt: "09:00",
      endsAt: "11:00",
      amount: 1,
    } as never)).rejects.toThrow(ConflictException);
  });

  it("propagates unrelated database errors normally", async () => {
    const prisma = createPrisma({
      booking: {
        findFirst: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockRejectedValue(new Error("Database connection lost")),
      },
    });
    const service = new BookingsService(prisma as never, {} as never);

    await expect(service.createBookingForUser("user-1", {
      venueId: "venue-1",
      courtId: "court-1",
      bookingDate: "2099-06-01",
      startsAt: "09:00",
      endsAt: "11:00",
      amount: 1,
    } as never)).rejects.toThrow("Database connection lost");
  });
});
