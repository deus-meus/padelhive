import { describe, expect, it, mock } from "bun:test";
import { BookingStatus, UserRole } from "@prisma/client";
import type { RequestUser } from "../auth/model";
import { AdminService } from "./service";

describe("AdminService", () => {
  const mockAdminUser: RequestUser = {
    id: "admin-1",
    firebaseUid: "fb-admin",
    email: "admin@padelhive.com",
    name: "Super Admin",
    role: UserRole.SUPER_ADMIN,
  };

  const mockOwnerUser: RequestUser = {
    id: "owner-1",
    firebaseUid: "fb-owner",
    email: "owner@padelhive.com",
    name: "Venue Owner",
    role: UserRole.VENUE_OWNER,
  };

  const mockBookingItem = {
    id: "b-1",
    bookingDate: new Date("2026-09-01T00:00:00.000Z"),
    startsAt: "09:00",
    endsAt: "10:00",
    durationMinutes: 60,
    status: BookingStatus.CONFIRMED,
    courtAmount: 200000,
    platformFee: 10000,
    voucherDiscount: 0,
    finalAmount: 210000,
    venue: { id: "venue-1", name: "Padel Club", city: "Jakarta" },
    court: { id: "court-1", name: "Court A", type: "OUTDOOR" },
    host: { id: "user-1", name: "Player One", email: "player@example.com" },
    payment: {
      id: "pay-1",
      amount: 210000,
      status: "PAID",
      provider: "MIDTRANS",
      method: "GOPAY",
    },
  };

  describe("getBookings", () => {
    it("returns paginated bookings for SUPER_ADMIN", async () => {
      const mockPrisma = {
        booking: {
          count: mock().mockResolvedValue(1),
          findMany: mock().mockResolvedValue([mockBookingItem]),
        },
      };
      const service = new AdminService(mockPrisma as never);

      const result = await service.getBookings(
        { page: "1", pageSize: "10" },
        mockAdminUser,
      );

      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(10);
      expect(result.items).toHaveLength(1);
      expect(result.items[0].id).toBe("b-1");
    });

    it("restricts query to owner venues for VENUE_OWNER", async () => {
      const mockPrisma = {
        booking: {
          count: mock().mockResolvedValue(0),
          findMany: mock().mockResolvedValue([]),
        },
      };
      const service = new AdminService(mockPrisma as never);

      await service.getBookings({}, mockOwnerUser);

      expect(mockPrisma.booking.count).toHaveBeenCalledWith({
        where: {
          venue: {
            OR: [
              { ownerId: "owner-1" },
              { admins: { some: { userId: "owner-1" } } },
            ],
          },
        },
      });
    });
  });

  describe("getOverview", () => {
    it("calculates platform overview metrics correctly", async () => {
      const mockPrisma = {
        booking: {
          aggregate: mock().mockResolvedValue({
            _sum: { finalAmount: 1000000, platformFee: 50000 },
            _count: { _all: 5 },
          }),
          count: mock().mockResolvedValue(10),
        },
        venue: {
          count: mock()
            .mockResolvedValueOnce(4) // active
            .mockResolvedValueOnce(1), // pending
        },
        refund: {
          count: mock().mockResolvedValue(2),
        },
        payment: {
          count: mock()
            .mockResolvedValueOnce(8) // paid
            .mockResolvedValueOnce(2), // failed
        },
      };
      const service = new AdminService(mockPrisma as never);

      const overview = await service.getOverview();

      expect(overview.gmv).toBe(1000000);
      expect(overview.commissionRevenue).toBe(50000);
      expect(overview.activeVenues).toBe(4);
      expect(overview.pendingApprovals).toBe(1);
      expect(overview.refundRequests).toBe(2);
      expect(overview.paymentSuccessRate).toBe(80); // 8 / (8 + 2)
      expect(overview.avgBookingValue).toBe(200000); // 1000000 / 5
    });
  });

  describe("getCommission", () => {
    it("aggregates venue commissions correctly", async () => {
      const mockVenueGroup = [
        {
          venueId: "venue-1",
          _sum: { finalAmount: 500000, platformFee: 25000 },
          _count: { _all: 2 },
        },
      ];
      const mockVenues = [
        {
          id: "venue-1",
          name: "Padel Club",
          city: "Jakarta",
          commissionRate: 5,
        },
      ];
      const mockPrisma = {
        booking: {
          groupBy: mock().mockResolvedValue(mockVenueGroup),
          findMany: mock().mockResolvedValue([
            {
              bookingDate: new Date("2026-09-01T00:00:00.000Z"),
              platformFee: 25000,
              finalAmount: 500000,
            },
          ]),
        },
        venue: {
          findMany: mock().mockResolvedValue(mockVenues),
        },
      };
      const service = new AdminService(mockPrisma as never);

      const result = await service.getCommission({});

      expect(result.totalCommission).toBe(25000);
      expect(result.totalGmv).toBe(500000);
      expect(result.totalBookings).toBe(2);
      expect(result.venues).toHaveLength(1);
      expect(result.venues[0].venueName).toBe("Padel Club");
    });
  });

  describe("getMetrics", () => {
    it("returns 12-month rolling platform metrics and status breakdown", async () => {
      const mockPrisma = {
        booking: {
          findMany: mock().mockResolvedValue([
            {
              bookingDate: new Date("2026-09-01T00:00:00.000Z"),
              finalAmount: 300000,
              platformFee: 15000,
            },
          ]),
          groupBy: mock().mockResolvedValue([
            { status: BookingStatus.COMPLETED, _count: { _all: 5 } },
            { status: BookingStatus.CONFIRMED, _count: { _all: 3 } },
          ]),
        },
      };
      const service = new AdminService(mockPrisma as never);

      const result = await service.getMetrics();

      expect(result.monthlySeries).toHaveLength(12);
      expect(result.totalGmv).toBe(300000);
      expect(result.totalCommission).toBe(15000);
      expect(result.statusBreakdown).toEqual([
        { status: BookingStatus.COMPLETED, count: 5 },
        { status: BookingStatus.CONFIRMED, count: 3 },
      ]);
    });
  });
});
