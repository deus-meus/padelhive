import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  mock,
  spyOn,
} from "bun:test";
import {
  BookingStatus,
  NotificationType,
  PaymentStatus,
  RefundStatus,
  RefundType,
} from "@prisma/client";
import { BookingExpiryService } from "./expiry.service";

describe("BookingExpiryService", () => {
  let service: BookingExpiryService;
  let prisma: {
    booking: { findMany: any };
    bookingCharge: { findMany: any };
    user: { findMany: any };
    bookingSplitShare?: { findMany: any };
    $transaction: any;
  };
  let txBookingUpdateManyMock: any;
  let txPaymentUpdateManyMock: any;
  let txVoucherUpdateManyMock: any;
  let txBookingChargeUpdateManyMock: any;
  let txRefundFindFirstMock: any;
  let txRefundCreateMock: any;
  let notificationsMock: any;
  let loggerLogSpy: any;

  beforeEach(() => {
    txBookingUpdateManyMock = mock().mockResolvedValue({ count: 1 });
    txPaymentUpdateManyMock = mock().mockResolvedValue({ count: 1 });
    txVoucherUpdateManyMock = mock().mockResolvedValue({ count: 0 });
    txBookingChargeUpdateManyMock = mock().mockResolvedValue({ count: 1 });
    txRefundFindFirstMock = mock().mockResolvedValue(null);
    txRefundCreateMock = mock().mockResolvedValue({});

    prisma = {
      booking: {
        findMany: mock(),
      },
      bookingCharge: { findMany: mock().mockResolvedValue([]) },
      user: { findMany: mock().mockResolvedValue([]) },
      bookingSplitShare: {
        findMany: mock().mockResolvedValue([]),
      },
      $transaction: mock(async (cb: (tx: any) => any) => {
        return cb({
          booking: { updateMany: txBookingUpdateManyMock },
          payment: { updateMany: txPaymentUpdateManyMock },
          voucher: { updateMany: txVoucherUpdateManyMock },
          bookingCharge: { updateMany: txBookingChargeUpdateManyMock },
          refund: {
            findFirst: txRefundFindFirstMock,
            create: txRefundCreateMock,
          },
        });
      }),
    };

    notificationsMock = { createNotification: mock() };
    const splitMock = {
      refundPaidShares: mock().mockResolvedValue({
        refundedCount: 0,
        failedCount: 0,
      }),
    };
    service = new BookingExpiryService(
      prisma as never,
      splitMock as never,
      notificationsMock as never,
    );
    loggerLogSpy = spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    loggerLogSpy?.mockRestore();
  });

  it("expires only due PENDING_PAYMENT bookings and fails their pending payments", async () => {
    prisma.booking.findMany.mockResolvedValue([
      { id: "booking-1" },
      { id: "booking-2" },
    ]);

    await service.sweepExpiredBookings();

    expect(prisma.booking.findMany).toHaveBeenCalledWith({
      where: {
        status: BookingStatus.PENDING_PAYMENT,
        expiresAt: { lte: expect.any(Date) },
      },
      select: { id: true, voucherId: true },
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
    expect(loggerLogSpy).toHaveBeenCalledWith(
      expect.stringContaining("Expired 2 stale pending-payment bookings."),
    );
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

  describe("sweepUnpaidRescheduleCharges", () => {
    it("cancels CONFIRMED booking, fails charge, queues FULL refund, notifies host", async () => {
      prisma.bookingCharge.findMany.mockResolvedValue([
        {
          id: "charge-1",
          bookingId: "booking-1",
          booking: {
            id: "booking-1",
            hostUserId: "host-1",
            payment: {
              id: "payment-1",
              amount: 150000,
              status: PaymentStatus.PAID,
            },
          },
        },
      ]);
      txBookingChargeUpdateManyMock.mockResolvedValue({ count: 1 });

      await service.sweepUnpaidRescheduleCharges();

      expect(txBookingChargeUpdateManyMock).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: "charge-1", status: PaymentStatus.PENDING },
          data: { status: PaymentStatus.FAILED, failedAt: expect.any(Date) },
        }),
      );
      expect(txBookingUpdateManyMock).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: "booking-1", status: BookingStatus.CONFIRMED },
          data: {
            status: BookingStatus.CANCELLED,
            cancelledAt: expect.any(Date),
          },
        }),
      );
      expect(txRefundCreateMock).toHaveBeenCalledWith({
        data: {
          bookingId: "booking-1",
          paymentId: "payment-1",
          amount: 150000,
          reason: "Auto-cancelled: reschedule balance not paid in time.",
          type: RefundType.FULL,
          status: RefundStatus.PENDING,
        },
      });
      expect(notificationsMock.createNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: "host-1",
          type: NotificationType.BOOKING_CANCELLED,
        }),
      );
    });

    it("no overdue charges", async () => {
      prisma.bookingCharge.findMany.mockResolvedValue([]);

      await service.sweepUnpaidRescheduleCharges();

      expect(txBookingChargeUpdateManyMock).not.toHaveBeenCalled();
      expect(txRefundCreateMock).not.toHaveBeenCalled();
      expect(notificationsMock.createNotification).not.toHaveBeenCalled();
    });

    it("concurrent-pay race: bookingCharge update matches 0", async () => {
      prisma.bookingCharge.findMany.mockResolvedValue([
        {
          id: "charge-1",
          bookingId: "booking-1",
          booking: { id: "booking-1", hostUserId: "host-1", payment: null },
        },
      ]);
      txBookingChargeUpdateManyMock.mockResolvedValue({ count: 0 });

      await service.sweepUnpaidRescheduleCharges();

      expect(txBookingChargeUpdateManyMock).toHaveBeenCalled();
      expect(txBookingUpdateManyMock).not.toHaveBeenCalled();
      expect(txRefundCreateMock).not.toHaveBeenCalled();
    });
  });
});
