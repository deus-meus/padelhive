import { BookingStatus, PaymentStatus } from "@prisma/client";
import { BookingExpiryService } from "./booking-expiry.service";

describe("BookingExpiryService", () => {
  let service: BookingExpiryService;
  let prisma: {
    booking: { findMany: jest.Mock };
    $transaction: jest.Mock;
  };
  let txBookingUpdateManyMock: jest.Mock;
  let txPaymentUpdateManyMock: jest.Mock;
  let loggerLogSpy: jest.SpyInstance;

  beforeEach(() => {
    txBookingUpdateManyMock = jest.fn().mockResolvedValue({ count: 1 });
    txPaymentUpdateManyMock = jest.fn().mockResolvedValue({ count: 1 });

    prisma = {
      booking: {
        findMany: jest.fn(),
      },
      $transaction: jest.fn(async (cb) => {
        return cb({
          booking: { updateMany: txBookingUpdateManyMock },
          payment: { updateMany: txPaymentUpdateManyMock },
        });
      }),
    };

    service = new BookingExpiryService(prisma as never);
    loggerLogSpy = jest.spyOn((service as unknown as { logger: { log: jest.Mock } }).logger, "log").mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("expires only due PENDING_PAYMENT bookings and fails their pending payments", async () => {
    prisma.booking.findMany.mockResolvedValue([{ id: "booking-1" }, { id: "booking-2" }]);

    await service.sweepExpiredBookings();

    expect(prisma.booking.findMany).toHaveBeenCalledWith({
      where: {
        status: BookingStatus.PENDING_PAYMENT,
        expiresAt: { lte: expect.any(Date) },
      },
      select: { id: true },
    });

    expect(prisma.$transaction).toHaveBeenCalled();
    expect(txBookingUpdateManyMock).toHaveBeenCalledWith({
      where: {
        id: { in: ["booking-1", "booking-2"] },
        status: BookingStatus.PENDING_PAYMENT,
        expiresAt: { lte: expect.any(Date) },
      },
      data: { status: BookingStatus.EXPIRED },
    });
    expect(txPaymentUpdateManyMock).toHaveBeenCalledWith({
      where: {
        bookingId: { in: ["booking-1", "booking-2"] },
        status: PaymentStatus.PENDING,
      },
      data: { status: PaymentStatus.FAILED, failedAt: expect.any(Date) },
    });
    expect(loggerLogSpy).toHaveBeenCalledWith("Expired 2 stale pending-payment bookings.");
  });

  it("leaves not-yet-due, CONFIRMED, and already-EXPIRED untouched (no-op when no bookings found)", async () => {
    prisma.booking.findMany.mockResolvedValue([]);

    await service.sweepExpiredBookings();

    expect(prisma.booking.findMany).toHaveBeenCalled();
    expect(prisma.$transaction).not.toHaveBeenCalled();
    expect(loggerLogSpy).not.toHaveBeenCalled();
  });

  it("concurrency: booking that gets confirmed right before updateMany is correctly filtered by the guard", async () => {
    // Simulate findMany finding a booking that is currently PENDING_PAYMENT
    prisma.booking.findMany.mockResolvedValue([{ id: "booking-1" }]);

    // Simulate updateMany matching 0 rows because the booking's status changed to CONFIRMED
    // (We test the guard by asserting the `where` clause passed to updateMany includes the status and expiresAt check)
    txBookingUpdateManyMock.mockResolvedValue({ count: 0 });

    await service.sweepExpiredBookings();

    expect(prisma.$transaction).toHaveBeenCalled();
    expect(txBookingUpdateManyMock).toHaveBeenCalledWith({
      where: {
        id: { in: ["booking-1"] },
        status: BookingStatus.PENDING_PAYMENT,
        expiresAt: { lte: expect.any(Date) },
      },
      data: { status: BookingStatus.EXPIRED },
    });
  });
});
