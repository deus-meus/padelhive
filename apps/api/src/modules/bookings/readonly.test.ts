import { NotFoundException } from "../../common/errors";
import { BookingStatus, CourtType } from "@prisma/client";
import { BookingsService } from "./service";

describe("Read-only bookings API", () => {
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
          courtAmount: 200000,
          platformFee: 10000,
          voucherDiscount: 0,
          finalAmount: 210000,
          venue: { id: "venue-1", name: "Padel Bali", city: "Bali" },
          court: { id: "court-1", name: "Court A", type: CourtType.OUTDOOR },
          host: { id: "user-1", name: "Player One", email: "player@padelhive.com" },
        }),
      },
      bookingCharge: {
        findFirst: jest.fn().mockResolvedValue(null),
      },
    };
    const service = new BookingsService(prisma as never, {} as never, { createNotification: jest.fn() } as never, {} as never);

    const booking = await service.findBookingForUser("booking-1", "user-1");

    expect(prisma.booking.findFirst).toHaveBeenCalledWith({
      where: { id: "booking-1", hostUserId: "user-1" },
      select: expect.any(Object),
    });
    expect(booking.id).toBe("booking-1");
  });

  it("throws NotFoundException when booking does not exist or user is not the host", async () => {
    const prisma = {
      booking: {
        findFirst: jest.fn().mockResolvedValue(null),
      },
    };
    const service = new BookingsService(prisma as never, {} as never, { createNotification: jest.fn() } as never, {} as never);

    await expect(service.findBookingForUser("booking-2", "user-1")).rejects.toThrow(NotFoundException);
  });
});
