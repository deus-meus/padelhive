import { BadRequestException, ConflictException, NotFoundException } from "@nestjs/common";
import { BookingStatus, CourtType, PaymentStatus, RefundStatus, RefundType } from "@prisma/client";
import { BookingsService } from "./bookings.service";

describe("BookingsService - rescheduleBookingForUser", () => {
  let service: BookingsService;
  let prismaMock: any;
  let vouchersMock: any;
  let safeNotifySpy: any;

  beforeEach(() => {
    prismaMock = {
      venue: { findFirst: jest.fn(), findUnique: jest.fn().mockResolvedValue(null) },
      court: { findFirst: jest.fn() },
      booking: {
        findFirst: jest.fn(),
        update: jest.fn(),
      },
      payment: {
        deleteMany: jest.fn(),
      },
      refund: {
        create: jest.fn(),
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
      {} as any,
      {} as any
    );
    safeNotifySpy = jest.spyOn(service as any, 'safeNotify').mockResolvedValue(undefined);
  });

  const reschedulableBooking = {
    id: "booking-1",
    status: BookingStatus.CONFIRMED,
    voucherId: "voucher-1",
    voucherDiscount: 10000,
    finalAmount: 190000,
    courtId: "court-1",
    venueId: "venue-1",
    payment: { id: "payment-1", status: PaymentStatus.PAID, provider: "midtrans" },
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

  it("throws BadRequestException on paid CONFIRMED booking when price increases", async () => {
    prismaMock.booking.findFirst
      .mockResolvedValueOnce(reschedulableBooking) 
      .mockResolvedValueOnce(null); 

    // new courtAmount = 200000. platform fee = 10000. subtotal = 210000. 
    // mock voucher giving 0 discount -> finalAmount = 210000 (increase from 190000)
    vouchersMock.repriceVoucherById.mockResolvedValue(0);

    await expect(service.rescheduleBookingForUser("booking-1", "user-1", rescheduleBody))
      .rejects.toThrow(BadRequestException);

    expect(prismaMock.booking.update).not.toHaveBeenCalled();
    expect(prismaMock.refund.create).not.toHaveBeenCalled();
  });

  it("creates partial refund on paid CONFIRMED booking when price decreases", async () => {
    prismaMock.booking.findFirst
      .mockResolvedValueOnce(reschedulableBooking)
      .mockResolvedValueOnce(null);

    // subtotal = 210000. mock voucher giving 30000 discount -> finalAmount = 180000 (decrease from 190000)
    vouchersMock.repriceVoucherById.mockResolvedValue(30000);

    const updatedMock = { id: "booking-1", finalAmount: 180000 };
    prismaMock.booking.update.mockResolvedValue(updatedMock);

    const result = await service.rescheduleBookingForUser("booking-1", "user-1", rescheduleBody);

    expect(prismaMock.refund.create).toHaveBeenCalledWith({
      data: {
        bookingId: "booking-1",
        paymentId: null,
        amount: 10000,
        reason: "Reschedule price difference",
        status: RefundStatus.PENDING,
        type: RefundType.RESCHEDULE_DIFF,
        events: expect.any(Object),
      },
    });

    expect(result.priceDelta).toBe(-10000);
    expect(safeNotifySpy).toHaveBeenCalled();
  });

  it("does not create refund if payment is PENDING (no paid payment)", async () => {
    prismaMock.booking.findFirst
      .mockResolvedValueOnce({ 
        ...reschedulableBooking, 
        status: BookingStatus.PENDING_PAYMENT,
        payment: { id: "payment-1", status: PaymentStatus.PENDING, provider: "midtrans" }
      })
      .mockResolvedValueOnce(null);

    // finalAmount will be 180000 (decrease)
    vouchersMock.repriceVoucherById.mockResolvedValue(30000);

    const updatedMock = { id: "booking-1", finalAmount: 180000 };
    prismaMock.booking.update.mockResolvedValue(updatedMock);

    const result = await service.rescheduleBookingForUser("booking-1", "user-1", rescheduleBody);

    expect(prismaMock.refund.create).not.toHaveBeenCalled();
    expect(result.priceDelta).toBe(-10000);
  });
});
