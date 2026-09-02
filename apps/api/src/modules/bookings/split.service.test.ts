import { describe, expect, it, mock } from "bun:test";
import { BookingStatus, SplitShareStatus } from "@prisma/client";
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from "../../common/errors";
import { BookingSplitService } from "./split.service";

describe("BookingSplitService", () => {
  const mockBooking = {
    id: "booking-1",
    hostUserId: "host-1",
    finalAmount: 400000,
    status: BookingStatus.CONFIRMED,
  };

  const mockShare = {
    id: "share-1",
    bookingId: "booking-1",
    name: "Player 1",
    email: "player1@example.com",
    userId: "user-1",
    inviteId: null,
    amount: 200000,
    status: SplitShareStatus.PENDING,
    paidAt: null,
  };

  const mockGateway = {
    createTransaction: mock().mockResolvedValue({
      token: "midtrans-token",
      redirectUrl: "http://example.com/pay",
    }),
    refundPayment: mock().mockResolvedValue({}),
  };

  const mockNotifications = {
    createNotification: mock().mockResolvedValue({}),
  };

  describe("getValidBooking validations", () => {
    it("throws NotFoundException if booking not found", async () => {
      const mockPrisma = {
        booking: { findUnique: mock().mockResolvedValue(null) },
      };
      const service = new BookingSplitService(
        mockPrisma as never,
        mockGateway as never,
        mockNotifications as never,
      );

      expect(service.getSplit("b-missing", "host-1")).rejects.toThrow(
        NotFoundException,
      );
    });

    it("throws ForbiddenException if non-host attempts access", async () => {
      const mockPrisma = {
        booking: { findUnique: mock().mockResolvedValue(mockBooking) },
      };
      const service = new BookingSplitService(
        mockPrisma as never,
        mockGateway as never,
        mockNotifications as never,
      );

      expect(service.getSplit("booking-1", "other-user")).rejects.toThrow(
        ForbiddenException,
      );
    });

    it("throws BadRequestException if booking is CANCELLED", async () => {
      const mockPrisma = {
        booking: {
          findUnique: mock().mockResolvedValue({
            ...mockBooking,
            status: BookingStatus.CANCELLED,
          }),
        },
      };
      const service = new BookingSplitService(
        mockPrisma as never,
        mockGateway as never,
        mockNotifications as never,
      );

      expect(service.getSplit("booking-1", "host-1")).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe("getSplit", () => {
    it("returns mapped split ledger", async () => {
      const mockPrisma = {
        booking: { findUnique: mock().mockResolvedValue(mockBooking) },
        bookingSplitShare: {
          findMany: mock().mockResolvedValue([mockShare]),
        },
      };
      const service = new BookingSplitService(
        mockPrisma as never,
        mockGateway as never,
        mockNotifications as never,
      );

      const result = await service.getSplit("booking-1", "host-1");
      expect(result.totalAmount).toBe(400000);
      expect(result.splitTotal).toBe(200000);
      expect(result.shareCount).toBe(1);
    });
  });

  describe("setSplit", () => {
    it("throws BadRequestException if payments have already been collected", async () => {
      const mockPrisma = {
        booking: { findUnique: mock().mockResolvedValue(mockBooking) },
        bookingSplitShare: { count: mock().mockResolvedValue(1) },
      };
      const service = new BookingSplitService(
        mockPrisma as never,
        mockGateway as never,
        mockNotifications as never,
      );

      expect(
        service.setSplit("booking-1", "host-1", {
          mode: "equal",
          participants: [{ name: "Player 1" }],
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it("calculates equal split with remainder correctly", async () => {
      const txMock = {
        bookingSplitShare: {
          findMany: mock()
            .mockResolvedValueOnce([])
            .mockResolvedValueOnce([
              { ...mockShare, amount: 200000 },
              { ...mockShare, id: "share-2", name: "Player 2", amount: 200000 },
            ]),
          deleteMany: mock().mockResolvedValue({}),
          createMany: mock().mockResolvedValue({}),
        },
      };

      const mockPrisma = {
        booking: { findUnique: mock().mockResolvedValue(mockBooking) },
        bookingSplitShare: { count: mock().mockResolvedValue(0) },
        $transaction: mock().mockImplementation(
          (cb: (tx: unknown) => unknown) => cb(txMock),
        ),
      };

      const service = new BookingSplitService(
        mockPrisma as never,
        mockGateway as never,
        mockNotifications as never,
      );

      const result = await service.setSplit("booking-1", "host-1", {
        mode: "equal",
        participants: [{ name: "Player 1" }, { name: "Player 2" }],
      });

      expect(result.splitTotal).toBe(400000);
      expect(txMock.bookingSplitShare.createMany).toHaveBeenCalledWith({
        data: expect.arrayContaining([
          expect.objectContaining({ name: "Player 1", amount: 200000 }),
          expect.objectContaining({ name: "Player 2", amount: 200000 }),
        ]),
      });
    });

    it("validates custom split sum matches finalAmount", async () => {
      const mockPrisma = {
        booking: { findUnique: mock().mockResolvedValue(mockBooking) },
        bookingSplitShare: { count: mock().mockResolvedValue(0) },
      };
      const service = new BookingSplitService(
        mockPrisma as never,
        mockGateway as never,
        mockNotifications as never,
      );

      expect(
        service.setSplit("booking-1", "host-1", {
          mode: "custom",
          participants: [
            { name: "P1", amount: 100000 },
            { name: "P2", amount: 100000 },
          ], // Sum = 200000 != 400000
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe("createSharePaymentIntent", () => {
    it("creates Midtrans transaction for unpaid share", async () => {
      const mockPrisma = {
        booking: { findUnique: mock().mockResolvedValue(mockBooking) },
        bookingSplitShare: {
          findFirst: mock().mockResolvedValue(mockShare),
          update: mock().mockResolvedValue({}),
        },
      };
      const service = new BookingSplitService(
        mockPrisma as never,
        mockGateway as never,
        mockNotifications as never,
      );

      const result = await service.createSharePaymentIntent(
        "booking-1",
        "share-1",
        "host-1",
        "ewallet",
      );

      expect(result.provider).toBe("midtrans");
      expect(result.redirectUrl).toBe("http://example.com/pay");
      expect(mockGateway.createTransaction).toHaveBeenCalledWith({
        orderId: expect.stringMatching(/^split-share-1-/),
        amount: 200000,
        method: "ewallet",
      });
    });
  });

  describe("refundPaidShares", () => {
    it("refunds paid shares via payment gateway", async () => {
      const paidShare = {
        ...mockShare,
        status: SplitShareStatus.PAID,
        provider: "midtrans",
        providerReference: "split-share-1-ref",
      };
      const mockPrisma = {
        bookingSplitShare: {
          findMany: mock().mockResolvedValue([paidShare]),
          update: mock().mockResolvedValue({}),
        },
      };
      const service = new BookingSplitService(
        mockPrisma as never,
        mockGateway as never,
        mockNotifications as never,
      );

      const result = await service.refundPaidShares("booking-1", {
        notifyHostUserId: "host-1",
      });

      expect(result.refundedCount).toBe(1);
      expect(result.failedCount).toBe(0);
      expect(mockGateway.refundPayment).toHaveBeenCalledWith(
        "split-share-1-ref",
        200000,
        "share-1-refund",
      );
      expect(mockNotifications.createNotification).toHaveBeenCalled();
    });
  });
});
