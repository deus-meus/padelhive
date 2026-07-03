import { BadRequestException, ConflictException, NotFoundException } from "@nestjs/common";
import { BookingStatus, CourtType, PaymentStatus, VenueStatus } from "@prisma/client";
import { BookingsService } from "./bookings.service";

describe("BookingsService - rescheduleBookingForUser", () => {
  let service: BookingsService;
  let prismaMock: any;
  let vouchersMock: any;

  beforeEach(() => {
    prismaMock = {
      venue: { findFirst: jest.fn() },
      court: { findFirst: jest.fn() },
      booking: {
        findFirst: jest.fn(),
        update: jest.fn(),
      },
      payment: {
        deleteMany: jest.fn(),
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
  });

  const reschedulableBooking = {
    id: "booking-1",
    status: BookingStatus.CONFIRMED,
    voucherId: "voucher-1",
    voucherDiscount: 10000,
    finalAmount: 190000,
    courtId: "court-1",
    venueId: "venue-1",
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

  it("recomputes voucher, deletes PENDING payments and exposes priceDelta", async () => {
    prismaMock.booking.findFirst
      .mockResolvedValueOnce(reschedulableBooking) // for the reschedule
      .mockResolvedValueOnce(null); // for assertNoOverlap

    // new courtAmount = 200000. platform fee = 10000. subtotal = 210000.
    vouchersMock.repriceVoucherById.mockResolvedValue(15000);

    const updatedMock = { id: "booking-1", finalAmount: 195000 };
    prismaMock.booking.update.mockResolvedValue(updatedMock);

    const result = await service.rescheduleBookingForUser("booking-1", "user-1", rescheduleBody);

    expect(vouchersMock.repriceVoucherById).toHaveBeenCalledWith("voucher-1", 210000);
    expect(prismaMock.payment.deleteMany).toHaveBeenCalledWith({
      where: { bookingId: "booking-1", status: PaymentStatus.PENDING },
    });
    
    expect(prismaMock.booking.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "booking-1" },
        data: expect.objectContaining({
          voucherDiscount: 15000,
          finalAmount: 195000,
        }),
      })
    );

    expect(result).toEqual({ ...updatedMock, priceDelta: 5000 });
  });

  it("works when booking has no voucher", async () => {
    prismaMock.booking.findFirst
      .mockResolvedValueOnce({ ...reschedulableBooking, voucherId: null, voucherDiscount: 0, finalAmount: 210000 })
      .mockResolvedValueOnce(null);

    const updatedMock = { id: "booking-1", finalAmount: 210000 };
    prismaMock.booking.update.mockResolvedValue(updatedMock);

    const result = await service.rescheduleBookingForUser("booking-1", "user-1", rescheduleBody);

    expect(vouchersMock.repriceVoucherById).not.toHaveBeenCalled();
    expect(result.priceDelta).toBe(0);
    expect(prismaMock.booking.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          voucherDiscount: 0,
          finalAmount: 210000,
        }),
      })
    );
  });
});
