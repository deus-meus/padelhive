import { describe, expect, it, mock } from "bun:test";
import {
  BookingStatus,
  CourtType,
  PaymentStatus,
  RefundStatus,
  VenueStatus,
} from "@prisma/client";
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from "../../common/errors";
import { BookingsService } from "./service";

const splitMock = {
  refundPaidShares: mock().mockResolvedValue({
    refundedCount: 0,
    failedCount: 0,
  }),
};

const approvedVenue = {
  id: "venue-1",
  name: "Padel Bali",
  city: "Bali",
  status: VenueStatus.APPROVED,
};
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
  voucherId: null,
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
  const defaultBookingCreate = mock().mockResolvedValue({
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
  });
  const defaultBookingUpdate = mock().mockResolvedValue({
    ...cancellableBooking,
    status: BookingStatus.CANCELLED,
  });

  const bookingCreate =
    (overrides.booking as Record<string, unknown>)?.create ??
    defaultBookingCreate;
  const bookingUpdate =
    (overrides.booking as Record<string, unknown>)?.update ??
    defaultBookingUpdate;

  return {
    venue: { findFirst: mock().mockResolvedValue(approvedVenue) },
    court: { findFirst: mock().mockResolvedValue(activeCourt) },
    booking: {
      findFirst: mock().mockResolvedValue(null),
      create: bookingCreate,
      update: bookingUpdate,
    },
    refund: { create: mock().mockResolvedValue({ id: "refund-1" }) },
    $transaction:
      overrides.$transaction ??
      mock(async (callback: (tx: unknown) => unknown) =>
        callback({
          booking: { create: bookingCreate, update: bookingUpdate },
          refund: { create: mock().mockResolvedValue({ id: "refund-1" }) },
          invite: { create: mock().mockResolvedValue({ id: "invite-1" }) },
          voucher: { update: mock(), updateMany: mock() },
        }),
      ),
    ...overrides,
  };
}

describe("Booking creation API", () => {
  it("creates a pending-payment booking with server-side pricing", async () => {
    const prisma = createPrisma();
    const service = new BookingsService(
      prisma as never,
      {} as never,
      { createNotification: mock() } as never,
      splitMock as never,
    );

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
      select: {
        id: true,
        name: true,
        city: true,
        status: true,
        openTime: true,
        closeTime: true,
        weeklyHours: true,
      },
    });
    expect(prisma.court.findFirst).toHaveBeenCalledWith({
      where: { id: "court-1", venueId: "venue-1", isActive: true },
      select: expect.objectContaining({
        weekdayPeak: true,
        weekdayOffPeak: true,
        weekendPeak: true,
        weekendOffPeak: true,
      }),
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
    const prisma = createPrisma({
      venue: { findFirst: mock().mockResolvedValue(null) },
    });
    const service = new BookingsService(
      prisma as never,
      {} as never,
      { createNotification: mock() } as never,
      splitMock as never,
    );

    expect(
      service.createBookingForUser("user-1", {
        venueId: "venue-pending",
        courtId: "court-1",
        bookingDate: "2099-06-01",
        startsAt: "09:00",
        endsAt: "10:00",
      }),
    ).rejects.toThrow(NotFoundException);
  });

  it("rejects inactive or wrong-venue court", async () => {
    const prisma = createPrisma({
      court: { findFirst: mock().mockResolvedValue(null) },
    });
    const service = new BookingsService(
      prisma as never,
      {} as never,
      { createNotification: mock() } as never,
      splitMock as never,
    );

    expect(
      service.createBookingForUser("user-1", {
        venueId: "venue-1",
        courtId: "court-inactive",
        bookingDate: "2099-06-01",
        startsAt: "09:00",
        endsAt: "10:00",
      }),
    ).rejects.toThrow(NotFoundException);
  });

  it("rejects invalid dates and non-whole-hour times", async () => {
    const service = new BookingsService(
      createPrisma() as never,
      {} as never,
      { createNotification: mock() } as never,
      splitMock as never,
    );

    expect(
      service.createBookingForUser("user-1", {
        venueId: "venue-1",
        courtId: "court-1",
        bookingDate: "2099-02-31",
        startsAt: "09:00",
        endsAt: "10:00",
      }),
    ).rejects.toThrow(BadRequestException);
    expect(
      service.createBookingForUser("user-1", {
        venueId: "venue-1",
        courtId: "court-1",
        bookingDate: "2099-06-01",
        startsAt: "09:30",
        endsAt: "10:00",
      }),
    ).rejects.toThrow(BadRequestException);
    expect(
      service.createBookingForUser("user-1", {
        venueId: "venue-1",
        courtId: "court-1",
        bookingDate: "2099-06-01",
        startsAt: "11:00",
        endsAt: "10:00",
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it("rejects past booking starts", async () => {
    const service = new BookingsService(
      createPrisma() as never,
      {} as never,
      { createNotification: mock() } as never,
      splitMock as never,
    );

    expect(
      service.createBookingForUser("user-1", {
        venueId: "venue-1",
        courtId: "court-1",
        bookingDate: "2000-01-01",
        startsAt: "09:00",
        endsAt: "10:00",
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it("rejects overlapping pending-payment or confirmed bookings", async () => {
    const prisma = createPrisma({
      booking: {
        findFirst: mock().mockResolvedValue({ id: "booking-existing" }),
        create: mock(),
      },
    });
    const service = new BookingsService(
      prisma as never,
      {} as never,
      { createNotification: mock() } as never,
      splitMock as never,
    );

    expect(
      service.createBookingForUser("user-1", {
        venueId: "venue-1",
        courtId: "court-1",
        bookingDate: "2099-06-01",
        startsAt: "09:00",
        endsAt: "10:00",
      }),
    ).rejects.toThrow(ConflictException);

    expect(prisma.booking.findFirst).toHaveBeenCalledWith({
      where: {
        courtId: "court-1",
        status: {
          in: [BookingStatus.PENDING_PAYMENT, BookingStatus.CONFIRMED],
        },
        startsAt: { lt: new Date("2099-06-01T03:00:00.000Z") },
        endsAt: { gt: new Date("2099-06-01T02:00:00.000Z") },
      },
      select: { id: true },
    });
    expect(prisma.booking.create).not.toHaveBeenCalled();
  });

  it("lets the owner cancel and creates pending refund for paid eligible bookings", async () => {
    const txBookingUpdate = mock().mockResolvedValue({
      ...cancellableBooking,
      status: BookingStatus.CANCELLED,
      cancelledAt: new Date("2099-05-31T02:00:00.000Z"),
    });
    const txRefundCreate = mock().mockResolvedValue({ id: "refund-1" });
    const prisma = createPrisma({
      booking: {
        findFirst: mock().mockResolvedValue(cancellableBooking),
        create: mock(),
        update: mock(),
      },
      $transaction: mock(async (callback: (tx: unknown) => unknown) =>
        callback({
          booking: { update: txBookingUpdate },
          refund: { create: txRefundCreate },
          voucher: { updateMany: mock() },
        }),
      ),
    });
    const service = new BookingsService(
      prisma as never,
      {} as never,
      { createNotification: mock() } as never,
      splitMock as never,
    );
    const now = new Date("2099-05-31T02:00:00.000Z");

    const result = await service.cancelBookingForUser(
      "booking-1",
      "user-1",
      now,
    );

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
        reason:
          "Full refund eligible: cancelled at least 24 hours before booking start.",
        status: RefundStatus.PENDING,
      },
    });
    expect(result.status).toBe(BookingStatus.CANCELLED);
    expect(result.isRefundEligible).toBe(true);
    expect(result.refundAmount).toBe(420000);
  });

  it("rejects cancel for missing or non-owned bookings", async () => {
    const service = new BookingsService(
      createPrisma({
        booking: {
          findFirst: mock().mockResolvedValue(null),
          create: mock(),
          update: mock(),
        },
      }) as never,
      {} as never,
      { createNotification: mock() } as never,
      splitMock as never,
    );

    expect(
      service.cancelBookingForUser(
        "booking-1",
        "user-2",
        new Date("2099-05-31T02:00:00.000Z"),
      ),
    ).rejects.toThrow(NotFoundException);
  });

  it("rejects completed bookings", async () => {
    const service = new BookingsService(
      createPrisma({
        booking: {
          findFirst: mock().mockResolvedValue({
            ...cancellableBooking,
            status: BookingStatus.COMPLETED,
          }),
          create: mock(),
          update: mock(),
        },
      }) as never,
      {} as never,
      { createNotification: mock() } as never,
      splitMock as never,
    );

    expect(
      service.cancelBookingForUser(
        "booking-1",
        "user-1",
        new Date("2099-05-31T02:00:00.000Z"),
      ),
    ).rejects.toThrow(BadRequestException);
  });

  it("rejects already cancelled bookings", async () => {
    const service = new BookingsService(
      createPrisma({
        booking: {
          findFirst: mock().mockResolvedValue({
            ...cancellableBooking,
            status: BookingStatus.CANCELLED,
          }),
          create: mock(),
          update: mock(),
        },
      }) as never,
      {} as never,
      { createNotification: mock() } as never,
      splitMock as never,
    );

    expect(
      service.cancelBookingForUser(
        "booking-1",
        "user-1",
        new Date("2099-05-31T02:00:00.000Z"),
      ),
    ).rejects.toThrow(BadRequestException);
  });

  it("does not create refund when cancellation is less than 24 hours before start", async () => {
    const txRefundCreate = mock();
    const prisma = createPrisma({
      booking: {
        findFirst: mock().mockResolvedValue(cancellableBooking),
        create: mock(),
        update: mock(),
      },
      $transaction: mock(async (callback: (tx: unknown) => unknown) =>
        callback({
          booking: {
            update: mock().mockResolvedValue({
              ...cancellableBooking,
              status: BookingStatus.CANCELLED,
            }),
          },
          refund: { create: txRefundCreate },
          voucher: { updateMany: mock() },
        }),
      ),
    });
    const service = new BookingsService(
      prisma as never,
      {} as never,
      { createNotification: mock() } as never,
      splitMock as never,
    );

    const result = await service.cancelBookingForUser(
      "booking-1",
      "user-1",
      new Date("2099-05-31T02:00:01.000Z"),
    );

    expect(result.isRefundEligible).toBe(false);
    expect(result.refundAmount).toBe(0);
    expect(txRefundCreate).not.toHaveBeenCalled();
  });

  it("does not create refund when eligible booking has no paid payment", async () => {
    const txRefundCreate = mock();
    const prisma = createPrisma({
      booking: {
        findFirst: mock().mockResolvedValue({
          ...cancellableBooking,
          payment: {
            ...cancellableBooking.payment,
            status: PaymentStatus.PENDING,
          },
        }),
        create: mock(),
        update: mock(),
      },
      $transaction: mock(async (callback: (tx: unknown) => unknown) =>
        callback({
          booking: {
            update: mock().mockResolvedValue({
              ...cancellableBooking,
              status: BookingStatus.CANCELLED,
            }),
          },
          refund: { create: txRefundCreate },
          voucher: { updateMany: mock() },
        }),
      ),
    });
    const service = new BookingsService(
      prisma as never,
      {} as never,
      { createNotification: mock() } as never,
      splitMock as never,
    );

    const result = await service.cancelBookingForUser(
      "booking-1",
      "user-1",
      new Date("2099-05-31T02:00:00.000Z"),
    );

    expect(result.isRefundEligible).toBe(true);
    expect(result.refundAmount).toBe(0);
    expect(txRefundCreate).not.toHaveBeenCalled();
  });

  it("prices correctly near weekend boundary and does not shift bookingDate off WIB day", async () => {
    const prisma = createPrisma();
    const service = new BookingsService(
      prisma as never,
      {} as never,
      { createNotification: mock() } as never,
      splitMock as never,
    );

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
        platformFee: 25000,
        voucherDiscount: 0,
        finalAmount: 525000,
      }),
      select: expect.any(Object),
    });
  });
});
