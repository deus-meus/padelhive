import { beforeEach, describe, expect, it, mock } from "bun:test";
import {
  BookingStatus,
  PaymentStatus,
  Prisma,
  RefundStatus,
  RefundType,
} from "@prisma/client";
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from "../../common/errors";
import type { PrismaService } from "../../common/prisma";
import { RefundsService } from "./service";

describe("RefundsService", () => {
  let service: RefundsService;

  const mockPrismaService = {
    booking: {
      findFirst: mock(),
      update: mock(),
    },
    payment: {
      update: mock(),
    },
    refund: {
      create: mock(),
      findMany: mock(),
      findUnique: mock(),
      findUniqueOrThrow: mock(),
      update: mock(),
      updateMany: mock(),
    },
    refundEvent: {
      create: mock(),
      findMany: mock(),
    },
    user: {
      findMany: mock(),
    },
    $transaction: mock(),
  };

  const mockPaymentGateway = {
    refundPayment: mock(),
  };

  const mockNotificationsService = {
    createNotification: mock(),
  };

  beforeEach(() => {
    mockPrismaService.booking.findFirst = mock();
    mockPrismaService.booking.update = mock();
    mockPrismaService.payment.update = mock();
    mockPrismaService.refund.create = mock();
    mockPrismaService.refund.findMany = mock();
    mockPrismaService.refund.findUnique = mock();
    mockPrismaService.refund.findUniqueOrThrow = mock();
    mockPrismaService.refund.update = mock();
    mockPrismaService.refund.updateMany = mock();
    mockPrismaService.refundEvent.create = mock();
    mockPrismaService.refundEvent.findMany = mock();
    mockPrismaService.user.findMany = mock().mockResolvedValue([]);
    mockPrismaService.$transaction = mock(
      async (cb: (arg: unknown) => unknown) => cb(mockPrismaService),
    );
    mockPaymentGateway.refundPayment = mock();
    mockNotificationsService.createNotification = mock();

    service = new RefundsService(
      mockPrismaService as unknown as PrismaService,
      mockPaymentGateway as any,
      mockNotificationsService as any,
    );
  });

  describe("createRefund", () => {
    it("should create refund successfully", async () => {
      mockPrismaService.booking.findFirst.mockResolvedValue({
        id: "booking-1",
        hostUserId: "user-1",
        payment: { id: "payment-1", amount: 100, status: PaymentStatus.PAID },
        refunds: [],
        venue: { name: "Test Venue", ownerId: "owner-1", admins: [] },
      });
      mockPrismaService.refund.create.mockResolvedValue({ id: "refund-1" });

      const result = await service.createRefund("user-1", {
        bookingId: "booking-1",
        reason: "reason 1",
      });
      expect(result).toEqual(expect.objectContaining({ id: "refund-1" }));
    });

    it("should throw 400 if reason is missing", async () => {
      expect(
        service.createRefund("user-1", { bookingId: "booking-1", reason: "" }),
      ).rejects.toThrow(BadRequestException);
    });

    it("should throw 404 if booking not found", async () => {
      mockPrismaService.booking.findFirst.mockResolvedValue(null);
      expect(
        service.createRefund("user-1", {
          bookingId: "booking-1",
          reason: "reason 1",
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it("should throw 400 if payment not PAID", async () => {
      mockPrismaService.booking.findFirst.mockResolvedValue({
        id: "booking-1",
        payment: {
          id: "payment-1",
          amount: 100,
          status: PaymentStatus.PENDING,
        },
        refunds: [],
        venue: { name: "Test Venue", ownerId: "owner-1", admins: [] },
      });
      expect(
        service.createRefund("user-1", {
          bookingId: "booking-1",
          reason: "reason 1",
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it("should throw 400 if a refund already exists", async () => {
      mockPrismaService.booking.findFirst.mockResolvedValue({
        id: "booking-1",
        payment: { id: "payment-1", amount: 100, status: PaymentStatus.PAID },
        refunds: [{ id: "refund-2" }],
        venue: { name: "Test Venue", ownerId: "owner-1", admins: [] },
      });
      expect(
        service.createRefund("user-1", {
          bookingId: "booking-1",
          reason: "reason 1",
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it("should successfully create refund even if booking is CANCELLED (handling settlement-on-cancelled edge case)", async () => {
      mockPrismaService.booking.findFirst.mockResolvedValue({
        id: "booking-1",
        status: BookingStatus.CANCELLED, // Booking is cancelled
        payment: { id: "payment-1", amount: 100, status: PaymentStatus.PAID }, // But payment is PAID
        refunds: [],
        venue: { name: "Test Venue", ownerId: "owner-1", admins: [] },
      });
      mockPrismaService.refund.create.mockResolvedValue({ id: "refund-1" });

      const result = await service.createRefund("user-1", {
        bookingId: "booking-1",
        reason: "reason 1",
      });
      expect(result).toEqual(expect.objectContaining({ id: "refund-1" }));
    });

    it("should throw ConflictException if P2002 happens", async () => {
      mockPrismaService.booking.findFirst.mockResolvedValue({
        id: "booking-1",
        payment: { id: "payment-1", amount: 100, status: PaymentStatus.PAID },
        refunds: [],
        venue: { name: "Test Venue", ownerId: "owner-1", admins: [] },
      });

      mockPrismaService.refund.create.mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError("Unique constraint failed", {
          code: "P2002",
          clientVersion: "1",
        }),
      );

      expect(
        service.createRefund("user-1", {
          bookingId: "booking-1",
          reason: "reason 1",
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe("admin transitions", () => {
    it("should approve a PENDING refund for venue owner", async () => {
      mockPrismaService.refund.findUnique.mockResolvedValue({
        id: "1",
        status: RefundStatus.PENDING,
        adminNotes: null,
        booking: { venue: { ownerId: "admin-1", admins: [] } },
      });
      mockPrismaService.refund.update.mockResolvedValue({
        id: "1",
        status: RefundStatus.APPROVED,
      });

      const result = await service.approveRefund("1", "admin-1", false, "ok");
      expect(result).toEqual(
        expect.objectContaining({ id: "1", status: RefundStatus.APPROVED }),
      );
      expect(mockPrismaService.refund.update).toHaveBeenCalledWith({
        where: { id: "1" },
        data: expect.objectContaining({
          status: RefundStatus.APPROVED,
          adminNotes: "ok",
          events: {
            create: {
              fromStatus: RefundStatus.PENDING,
              toStatus: RefundStatus.APPROVED,
              actorUserId: "admin-1",
              notes: "ok",
            },
          },
        }),
      });
    });

    it("should approve if venue admin is in venue.admins array", async () => {
      mockPrismaService.refund.findUnique.mockResolvedValue({
        id: "1",
        status: RefundStatus.PENDING,
        adminNotes: null,
        booking: {
          venue: { ownerId: "other-owner", admins: [{ userId: "admin-1" }] },
        },
      });
      mockPrismaService.refund.update.mockResolvedValue({
        id: "1",
        status: RefundStatus.APPROVED,
      });
      const result = await service.approveRefund("1", "admin-1", false, "ok");
      expect(result).toEqual(
        expect.objectContaining({ id: "1", status: RefundStatus.APPROVED }),
      );
    });

    it("should throw 404 if venue admin approves another venue's refund", async () => {
      mockPrismaService.refund.findUnique.mockResolvedValue({
        id: "1",
        status: RefundStatus.PENDING,
        adminNotes: null,
        booking: { venue: { ownerId: "other-owner", admins: [] } },
      });
      expect(
        service.approveRefund("1", "admin-1", false, "ok"),
      ).rejects.toThrow(NotFoundException);
    });

    it("should throw 400 if approving a non-PENDING refund", async () => {
      mockPrismaService.refund.findUnique.mockResolvedValue({
        id: "1",
        status: RefundStatus.APPROVED,
        booking: { venue: { ownerId: "admin-1", admins: [] } },
      });
      expect(
        service.approveRefund("1", "admin-1", false, "ok"),
      ).rejects.toThrow(BadRequestException);
    });

    it("should reject a PENDING refund", async () => {
      mockPrismaService.refund.findUnique.mockResolvedValue({
        id: "1",
        status: RefundStatus.PENDING,
        booking: { venue: { ownerId: "admin-1", admins: [] } },
      });
      mockPrismaService.refund.update.mockResolvedValue({
        id: "1",
        status: RefundStatus.REJECTED,
      });

      const result = await service.rejectRefund("1", "admin-1", false, "no");
      expect(result).toEqual(
        expect.objectContaining({ id: "1", status: RefundStatus.REJECTED }),
      );
    });

    it("should throw 400 if rejecting with no notes", async () => {
      expect(service.rejectRefund("1", "admin-1", false, "")).rejects.toThrow(
        BadRequestException,
      );
    });

    it("should throw 400 if rejecting a non-PENDING refund", async () => {
      mockPrismaService.refund.findUnique.mockResolvedValue({
        id: "1",
        status: RefundStatus.APPROVED,
        booking: { venue: { ownerId: "admin-1", admins: [] } },
      });
      expect(service.rejectRefund("1", "admin-1", false, "no")).rejects.toThrow(
        BadRequestException,
      );
    });

    it("processRefund should call gateway for midtrans provider and update booking/payment", async () => {
      mockPrismaService.refund.findUnique.mockResolvedValue({
        id: "1",
        amount: 100,
        status: RefundStatus.APPROVED,
        paymentId: "p-1",
        payment: { id: "p-1", provider: "midtrans" },
        bookingId: "b-1",
        booking: {
          status: BookingStatus.CONFIRMED,
          venue: { ownerId: "admin-1", admins: [] },
        },
      });
      mockPrismaService.refund.updateMany.mockResolvedValue({ count: 1 });
      mockPrismaService.refund.findUniqueOrThrow.mockResolvedValue({
        id: "1",
        status: RefundStatus.PROCESSED,
      });
      mockPaymentGateway.refundPayment.mockResolvedValue(undefined);

      const result = await service.processRefund("1", "admin-1", false);
      expect(result).toEqual(
        expect.objectContaining({ id: "1", status: RefundStatus.PROCESSED }),
      );

      expect(mockPaymentGateway.refundPayment).toHaveBeenCalledWith(
        "p-1",
        100,
        "1",
      );
      expect(mockPrismaService.refund.updateMany).toHaveBeenCalledWith({
        where: { id: "1", status: RefundStatus.APPROVED },
        data: { status: RefundStatus.PROCESSED, processedAt: expect.any(Date) },
      });
    });

    it("processRefund should skip booking cancellation for RESCHEDULE_DIFF", async () => {
      mockPrismaService.refund.findUnique.mockResolvedValue({
        id: "1",
        amount: 100,
        status: RefundStatus.APPROVED,
        type: RefundType.RESCHEDULE_DIFF,
        paymentId: "p-1",
        payment: { id: "p-1", provider: "midtrans" },
        bookingId: "b-1",
        booking: {
          status: BookingStatus.CONFIRMED,
          venue: { ownerId: "admin-1", admins: [] },
        },
      });
      mockPrismaService.refund.updateMany.mockResolvedValue({ count: 1 });
      mockPrismaService.refund.findUniqueOrThrow.mockResolvedValue({
        id: "1",
        status: RefundStatus.PROCESSED,
      });
      mockPaymentGateway.refundPayment.mockResolvedValue(undefined);

      await service.processRefund("1", "admin-1", false);

      expect(mockPaymentGateway.refundPayment).toHaveBeenCalledWith(
        "p-1",
        100,
        "1",
      );
      expect(mockPrismaService.refund.updateMany).toHaveBeenCalled();
      expect(mockPrismaService.booking.update).not.toHaveBeenCalled();
    });

    it("processRefund should skip gateway for internal provider", async () => {
      mockPrismaService.refund.findUnique.mockResolvedValue({
        id: "1",
        amount: 100,
        status: RefundStatus.APPROVED,
        paymentId: "p-1",
        payment: { id: "p-1", provider: "internal" },
        bookingId: "b-1",
        booking: {
          status: BookingStatus.CONFIRMED,
          venue: { ownerId: "admin-1", admins: [] },
        },
      });
      mockPrismaService.refund.updateMany.mockResolvedValue({ count: 1 });
      mockPrismaService.refund.findUniqueOrThrow.mockResolvedValue({
        id: "1",
        status: RefundStatus.PROCESSED,
      });

      const result = await service.processRefund("1", "admin-1", false);
      expect(result).toEqual(
        expect.objectContaining({ id: "1", status: RefundStatus.PROCESSED }),
      );

      expect(mockPaymentGateway.refundPayment).not.toHaveBeenCalled();
    });

    it("processRefund should reject if gateway throws and not call transaction", async () => {
      mockPrismaService.refund.findUnique.mockResolvedValue({
        id: "1",
        amount: 100,
        status: RefundStatus.APPROVED,
        paymentId: "p-1",
        payment: { id: "p-1", provider: "midtrans" },
        bookingId: "b-1",
        booking: {
          status: BookingStatus.CONFIRMED,
          venue: { ownerId: "admin-1", admins: [] },
        },
      });
      mockPaymentGateway.refundPayment.mockRejectedValue(
        new Error("Midtrans error"),
      );

      expect(service.processRefund("1", "admin-1", false)).rejects.toThrow(
        "Midtrans error",
      );
      expect(mockPrismaService.$transaction).not.toHaveBeenCalled();
    });

    it("processRefund should throw 400 and not call gateway if refund is not APPROVED", async () => {
      mockPrismaService.refund.findUnique.mockResolvedValue({
        id: "1",
        amount: 100,
        status: RefundStatus.PENDING,
        paymentId: "p-1",
        payment: { id: "p-1", provider: "midtrans" },
        bookingId: "b-1",
        booking: {
          status: BookingStatus.CONFIRMED,
          venue: { ownerId: "admin-1", admins: [] },
        },
      });

      expect(service.processRefund("1", "admin-1", false)).rejects.toThrow(
        BadRequestException,
      );
      expect(mockPaymentGateway.refundPayment).not.toHaveBeenCalled();
    });

    it("process on a COMPLETED booking marks Payment REFUNDED but leaves booking COMPLETED", async () => {
      mockPrismaService.refund.findUnique.mockResolvedValue({
        id: "1",
        amount: 100,
        status: RefundStatus.APPROVED,
        paymentId: "p-1",
        payment: { id: "p-1", provider: "internal" },
        bookingId: "b-1",
        booking: {
          status: BookingStatus.COMPLETED,
          venue: { ownerId: "admin-1", admins: [] },
        },
      });
      mockPrismaService.refund.updateMany.mockResolvedValue({ count: 1 });
      mockPrismaService.refund.findUniqueOrThrow.mockResolvedValue({
        id: "1",
        status: RefundStatus.PROCESSED,
      });

      await service.processRefund("1", "admin-1", false);

      expect(mockPrismaService.payment.update).toHaveBeenCalledWith({
        where: { id: "p-1" },
        data: { status: PaymentStatus.REFUNDED },
      });
      expect(mockPrismaService.booking.update).not.toHaveBeenCalled();
    });

    it("process on an already CANCELLED booking marks Payment REFUNDED but leaves booking CANCELLED", async () => {
      mockPrismaService.refund.findUnique.mockResolvedValue({
        id: "1",
        amount: 100,
        status: RefundStatus.APPROVED,
        paymentId: "p-1",
        payment: { id: "p-1", provider: "internal" },
        bookingId: "b-1",
        booking: {
          status: BookingStatus.CANCELLED,
          venue: { ownerId: "admin-1", admins: [] },
        },
      });
      mockPrismaService.refund.updateMany.mockResolvedValue({ count: 1 });
      mockPrismaService.refund.findUniqueOrThrow.mockResolvedValue({
        id: "1",
        status: RefundStatus.PROCESSED,
      });

      await service.processRefund("1", "admin-1", false);

      expect(mockPrismaService.payment.update).toHaveBeenCalledWith({
        where: { id: "p-1" },
        data: { status: PaymentStatus.REFUNDED },
      });
      expect(mockPrismaService.booking.update).not.toHaveBeenCalled();
    });
  });
});
