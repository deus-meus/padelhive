import { BookingStatus } from "@prisma/client";
import { BookingsService } from "./bookings.service";

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
    service = new BookingsService(prisma as never);
  });

  describe("findBookingsForUser", () => {
    it("uses Jakarta timezone for upcoming filter", async () => {
      // Use a date that is 23:00 UTC (06:00 WIB next day)
      jest.useFakeTimers();
      jest.setSystemTime(new Date("2026-06-15T23:00:00.000Z"));

      await service.findBookingsForUser("user-1", "upcoming");

      expect(prisma.booking.findMany).toHaveBeenCalledWith({
        where: {
          hostUserId: "user-1",
          status: { in: [BookingStatus.PENDING_PAYMENT, BookingStatus.CONFIRMED] },
          bookingDate: { gte: new Date("2026-06-16T00:00:00.000Z") },
        },
        orderBy: { bookingDate: "desc" },
        select: expect.any(Object),
      });

      jest.useRealTimers();
    });

    it("returns same day when UTC and Jakarta are in same calendar day", async () => {
      // Use a date that is 10:00 UTC (17:00 WIB same day)
      jest.useFakeTimers();
      jest.setSystemTime(new Date("2026-06-15T10:00:00.000Z"));

      await service.findBookingsForUser("user-1", "upcoming");

      expect(prisma.booking.findMany).toHaveBeenCalledWith({
        where: {
          hostUserId: "user-1",
          status: { in: [BookingStatus.PENDING_PAYMENT, BookingStatus.CONFIRMED] },
          bookingDate: { gte: new Date("2026-06-15T00:00:00.000Z") },
        },
        orderBy: { bookingDate: "desc" },
        select: expect.any(Object),
      });

      jest.useRealTimers();
    });

    it("handles month boundary correctly", async () => {
      // Use a date that is 2026-06-01 23:00 UTC (2026-06-02 06:00 WIB)
      jest.useFakeTimers();
      jest.setSystemTime(new Date("2026-06-01T23:00:00.000Z"));

      await service.findBookingsForUser("user-1", "upcoming");

      expect(prisma.booking.findMany).toHaveBeenCalledWith({
        where: {
          hostUserId: "user-1",
          status: { in: [BookingStatus.PENDING_PAYMENT, BookingStatus.CONFIRMED] },
          bookingDate: { gte: new Date("2026-06-02T00:00:00.000Z") },
        },
        orderBy: { bookingDate: "desc" },
        select: expect.any(Object),
      });

      jest.useRealTimers();
    });

    it("handles year boundary correctly", async () => {
      // Use a date that is 2026-12-31 23:00 UTC (2027-01-01 06:00 WIB)
      jest.useFakeTimers();
      jest.setSystemTime(new Date("2026-12-31T23:00:00.000Z"));

      await service.findBookingsForUser("user-1", "upcoming");

      expect(prisma.booking.findMany).toHaveBeenCalledWith({
        where: {
          hostUserId: "user-1",
          status: { in: [BookingStatus.PENDING_PAYMENT, BookingStatus.CONFIRMED] },
          bookingDate: { gte: new Date("2027-01-01T00:00:00.000Z") },
        },
        orderBy: { bookingDate: "desc" },
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
        orderBy: { bookingDate: "desc" },
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
        orderBy: { bookingDate: "desc" },
        select: expect.any(Object),
      });
    });
  });
});