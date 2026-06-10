import { NotFoundException } from "@nestjs/common";
import { BookingStatus, CourtType, UserRole } from "@prisma/client";
import { RequestUser } from "../auth/types/request-user.type";
import { BookingsController } from "./bookings.controller";
import { BookingsService } from "./bookings.service";

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
    const service = new BookingsService(prisma as never, {} as never);

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
    const service = new BookingsService(prisma as never, {} as never);

    await expect(service.findBookingForUser("booking-2", "user-1")).rejects.toThrow(NotFoundException);
  });

  it("returns current user's booking from controller", async () => {
    const booking = { id: "booking-1" };
    const service = { findBookingForUser: jest.fn().mockResolvedValue(booking) } as unknown as BookingsService;
    const controller = new BookingsController(service, {} as never);

    await expect(controller.findOne("booking-1", requestUser)).resolves.toEqual(booking);
    expect(service.findBookingForUser).toHaveBeenCalledWith("booking-1", "user-1");
  });
});
