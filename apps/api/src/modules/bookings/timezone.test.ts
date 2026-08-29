import { BookingStatus } from "@prisma/client";
import { BookingsService } from "./service";

describe("Booking timezone classification", () => {
  let service: BookingsService;
  let prisma: {
    booking: {
      findMany: jest.Mock;
    };
  };

  beforeEach(() => {
    prisma = {
      booking: {
        findMany: jest.fn().mockResolvedValue([]),
      },
    };
    service = new BookingsService(
      prisma as never,
      {} as never,
      { createNotification: jest.fn() } as never,
      {} as never,
    );
  });

  describe("findBookingsForUser", () => {
    it("uses upcoming filter", async () => {
      const now = new Date("2026-06-15T23:00:00.000Z");
      jest.useFakeTimers();
      jest.setSystemTime(now);

      await service.findBookingsForUser("user-1", "upcoming");

      expect(prisma.booking.findMany).toHaveBeenCalledWith({
        where: {
          hostUserId: "user-1",
          status: {
            in: [BookingStatus.CONFIRMED, BookingStatus.PENDING_PAYMENT],
          },
          endsAt: { gt: now },
        },
        orderBy: { startsAt: "asc" },
        select: expect.any(Object),
      });

      jest.useRealTimers();
    });

    it("does not filter by date for past bookings", async () => {
      await service.findBookingsForUser("user-1", "past");

      expect(prisma.booking.findMany).toHaveBeenCalledWith({
        where: {
          hostUserId: "user-1",
          status: BookingStatus.COMPLETED,
        },
        orderBy: { startsAt: "desc" },
        select: expect.any(Object),
      });
    });

    it("does not filter by date for cancelled bookings", async () => {
      await service.findBookingsForUser("user-1", "cancelled");

      expect(prisma.booking.findMany).toHaveBeenCalledWith({
        where: {
          hostUserId: "user-1",
          status: BookingStatus.CANCELLED,
        },
        orderBy: { startsAt: "desc" },
        select: expect.any(Object),
      });
    });
  });
});
