import {
  BookingStatus,
  CourtType,
  PaymentStatus,
  RefundStatus,
  RefundType,
} from "@prisma/client";
import { BookingsService } from "./service";

describe("BookingsService - rescheduleBookingForUser", () => {
  let service: BookingsService;
  let prismaMock: any;
  let vouchersMock: any;
  let safeNotifySpy: any;

  beforeEach(() => {
    prismaMock = {
      venue: {
        findFirst: jest.fn(),
        findUnique: jest.fn().mockResolvedValue({
          id: "venue-1",
          name: "Venue 1",
          ownerId: "owner-1",
          admins: [],
        }),
      },
      court: { findFirst: jest.fn() },
      booking: {
        findFirst: jest.fn(),
        update: jest.fn(),
      },
      bookingSplitShare: {
        count: jest.fn().mockResolvedValue(0),
      },
      payment: {
        deleteMany: jest.fn(),
      },
      refund: {
        create: jest.fn(),
      },
      bookingCharge: {
        deleteMany: jest.fn(),
        create: jest.fn(),
        findFirst: jest.fn(),
      },
      user: {
        findMany: jest.fn().mockResolvedValue([]),
      },
      $transaction: jest.fn(async (cb) => cb(prismaMock)),
    };
    vouchersMock = {
      repriceVoucherById: jest.fn(),
    };
    service = new BookingsService(
      prismaMock as any,
      vouchersMock as any,
      { createNotification: jest.fn() } as any,
      { refundPaidShares: jest.fn() } as any,
    );
    safeNotifySpy = jest
      .spyOn(service as any, "safeNotify")
      .mockResolvedValue(undefined);
  });

  const reschedulableBooking = {
    id: "booking-1",
    status: BookingStatus.CONFIRMED,
    voucherId: "voucher-1",
    voucherDiscount: 10000,
    finalAmount: 190000,
    courtId: "court-1",
    venueId: "venue-1",
    payment: {
      id: "payment-1",
      status: PaymentStatus.PAID,
      provider: "midtrans",
      method: "card",
    },
    venue: {
      openTime: "06:00",
      closeTime: "22:00",
      weeklyHours: null,
    },
    court: {
      id: "court-1",
      type: CourtType.OUTDOOR,
      weekdayPeak: 200000,
      weekdayOffPeak: 200000,
      weekendPeak: 200000,
      weekendOffPeak: 200000,
    },
  };

  const rescheduleBody = {
    bookingDate: "2099-06-01",
    startsAt: "10:00",
    endsAt: "11:00",
  };

  it("creates top-up charge on paid CONFIRMED booking when price increases", async () => {
    prismaMock.booking.findFirst
      .mockResolvedValueOnce(reschedulableBooking)
      .mockResolvedValueOnce(null);

    // new courtAmount = 200000. platform fee = 10000. subtotal = 210000.
    // mock voucher giving 0 discount -> finalAmount = 210000 (increase from 190000)
    vouchersMock.repriceVoucherById.mockResolvedValue(0);

    const updatedMock = { id: "booking-1", finalAmount: 210000 };
    prismaMock.booking.update.mockResolvedValue(updatedMock);

    const result = await service.rescheduleBookingForUser(
      "booking-1",
      "user-1",
      rescheduleBody,
    );

    expect(prismaMock.bookingCharge.deleteMany).toHaveBeenCalledWith({
      where: { bookingId: "booking-1", status: PaymentStatus.PENDING },
    });
    expect(prismaMock.bookingCharge.create).toHaveBeenCalledWith({
      data: {
        bookingId: "booking-1",
        amount: 20000,
        reason: "Reschedule difference",
        status: PaymentStatus.PENDING,
        provider: "midtrans",
        method: "card",
      },
    });

    expect(result.priceDelta).toBe(20000);
    expect(safeNotifySpy).toHaveBeenCalled();
  });

  it("creates partial refund on paid CONFIRMED booking when price decreases", async () => {
    prismaMock.booking.findFirst
      .mockResolvedValueOnce(reschedulableBooking)
      .mockResolvedValueOnce(null);

    // subtotal = 210000. mock voucher giving 30000 discount -> finalAmount = 180000 (decrease from 190000)
    vouchersMock.repriceVoucherById.mockResolvedValue(30000);

    const updatedMock = { id: "booking-1", finalAmount: 180000 };
    prismaMock.booking.update.mockResolvedValue(updatedMock);

    const result = await service.rescheduleBookingForUser(
      "booking-1",
      "user-1",
      rescheduleBody,
    );

    expect(prismaMock.refund.create).toHaveBeenCalledWith({
      data: {
        bookingId: "booking-1",
        paymentId: "payment-1",
        amount: 10000,
        reason: "Partial refund from reschedule",
        type: RefundType.RESCHEDULE_DIFF,
        status: RefundStatus.PENDING,
        adminNotes: "Auto-generated from reschedule price decrease",
      },
    });

    expect(result.priceDelta).toBe(-10000);
    expect(safeNotifySpy).toHaveBeenCalled();
  });

  it("resolves successfully with partial refund even when notification read rejects", async () => {
    prismaMock.booking.findFirst
      .mockResolvedValueOnce(reschedulableBooking)
      .mockResolvedValueOnce(null);

    vouchersMock.repriceVoucherById.mockResolvedValue(30000);

    const updatedMock = { id: "booking-1", finalAmount: 180000 };
    prismaMock.booking.update.mockResolvedValue(updatedMock);

    prismaMock.user.findMany.mockRejectedValueOnce(new Error("DB error"));
    const warnSpy = jest.spyOn(console, "warn").mockImplementation();

    const result = await service.rescheduleBookingForUser(
      "booking-1",
      "user-1",
      rescheduleBody,
    );
    warnSpy.mockRestore();

    expect(prismaMock.refund.create).toHaveBeenCalled();
    expect(result.priceDelta).toBe(-10000);
  });

  it("does not create refund if payment is PENDING (no paid payment)", async () => {
    prismaMock.booking.findFirst
      .mockResolvedValueOnce({
        ...reschedulableBooking,
        status: BookingStatus.PENDING_PAYMENT,
        payment: {
          id: "payment-1",
          status: PaymentStatus.PENDING,
          provider: "midtrans",
        },
      })
      .mockResolvedValueOnce(null);

    // finalAmount will be 180000 (decrease)
    vouchersMock.repriceVoucherById.mockResolvedValue(30000);

    const updatedMock = { id: "booking-1", finalAmount: 180000 };
    prismaMock.booking.update.mockResolvedValue(updatedMock);

    const result = await service.rescheduleBookingForUser(
      "booking-1",
      "user-1",
      rescheduleBody,
    );

    expect(prismaMock.refund.create).not.toHaveBeenCalled();
    expect(result.priceDelta).toBe(-10000);
  });
});
