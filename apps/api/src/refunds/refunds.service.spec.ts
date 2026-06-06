import { Test, TestingModule } from "@nestjs/testing";
import { RefundsService } from "./refunds.service";
import { PrismaService } from "../prisma/prisma.service";
import { BadRequestException, ConflictException, NotFoundException } from "@nestjs/common";
import { BookingStatus, PaymentStatus, Prisma, RefundStatus } from "@prisma/client";

describe("RefundsService", () => {
  let service: RefundsService;

  const mockPrismaService = {
    booking: {
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    payment: {
      update: jest.fn(),
    },
    refund: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findUniqueOrThrow: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
    refundEvent: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  beforeEach(async () => {
    mockPrismaService.$transaction.mockImplementation(async (cb: (arg: unknown) => unknown) => cb(mockPrismaService));
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RefundsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<RefundsService>(RefundsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("createRefund", () => {
    it("should create refund successfully", async () => {
      mockPrismaService.booking.findFirst.mockResolvedValue({
        id: "booking-1",
        hostUserId: "user-1",
        payment: { id: "payment-1", amount: 100, status: PaymentStatus.PAID },
        refunds: [],
      });
      mockPrismaService.refund.create.mockResolvedValue({ id: "refund-1" });

      await expect(service.createRefund("user-1", { bookingId: "booking-1", reason: "reason 1" }))
        .resolves.toEqual({ id: "refund-1" });
    });

    it("should throw 400 if reason is missing", async () => {
      await expect(service.createRefund("user-1", { bookingId: "booking-1", reason: "" }))
        .rejects.toThrow(BadRequestException);
    });

    it("should throw 404 if booking not found", async () => {
      mockPrismaService.booking.findFirst.mockResolvedValue(null);
      await expect(service.createRefund("user-1", { bookingId: "booking-1", reason: "reason 1" }))
        .rejects.toThrow(NotFoundException);
    });

    it("should throw 400 if payment not PAID", async () => {
      mockPrismaService.booking.findFirst.mockResolvedValue({
        id: "booking-1",
        payment: { id: "payment-1", amount: 100, status: PaymentStatus.PENDING },
        refunds: [],
      });
      await expect(service.createRefund("user-1", { bookingId: "booking-1", reason: "reason 1" }))
        .rejects.toThrow(BadRequestException);
    });

    it("should throw 400 if a refund already exists", async () => {
      mockPrismaService.booking.findFirst.mockResolvedValue({
        id: "booking-1",
        payment: { id: "payment-1", amount: 100, status: PaymentStatus.PAID },
        refunds: [{ id: "refund-2" }],
      });
      await expect(service.createRefund("user-1", { bookingId: "booking-1", reason: "reason 1" }))
        .rejects.toThrow(BadRequestException);
    });

    it("should successfully create refund even if booking is CANCELLED (handling settlement-on-cancelled edge case)", async () => {
      mockPrismaService.booking.findFirst.mockResolvedValue({
        id: "booking-1",
        status: BookingStatus.CANCELLED, // Booking is cancelled
        payment: { id: "payment-1", amount: 100, status: PaymentStatus.PAID }, // But payment is PAID
        refunds: [],
      });
      mockPrismaService.refund.create.mockResolvedValue({ id: "refund-1" });

      await expect(service.createRefund("user-1", { bookingId: "booking-1", reason: "reason 1" }))
        .resolves.toEqual({ id: "refund-1" });
    });

    it("should throw ConflictException if P2002 happens", async () => {
      mockPrismaService.booking.findFirst.mockResolvedValue({
        id: "booking-1",
        payment: { id: "payment-1", amount: 100, status: PaymentStatus.PAID },
        refunds: [],
      });

      mockPrismaService.refund.create.mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError("Unique constraint failed", { code: "P2002", clientVersion: "1" })
      );

      await expect(service.createRefund("user-1", { bookingId: "booking-1", reason: "reason 1" }))
        .rejects.toThrow(ConflictException);
    });
  });

  describe("admin transitions", () => {
    it("should approve a PENDING refund", async () => {
      mockPrismaService.refund.findUnique.mockResolvedValue({ id: "1", status: RefundStatus.PENDING, adminNotes: null });
      mockPrismaService.refund.update.mockResolvedValue({ id: "1", status: RefundStatus.APPROVED });

      await expect(service.approveRefund("1", "admin-1", "ok")).resolves.toEqual({ id: "1", status: RefundStatus.APPROVED });
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

    it("should throw 400 if approving a non-PENDING refund", async () => {
      mockPrismaService.refund.findUnique.mockResolvedValue({ id: "1", status: RefundStatus.APPROVED });
      await expect(service.approveRefund("1", "admin-1", "ok")).rejects.toThrow(BadRequestException);
    });

    it("should reject a PENDING refund", async () => {
      mockPrismaService.refund.findUnique.mockResolvedValue({ id: "1", status: RefundStatus.PENDING });
      mockPrismaService.refund.update.mockResolvedValue({ id: "1", status: RefundStatus.REJECTED });

      await expect(service.rejectRefund("1", "admin-1", "no")).resolves.toEqual({ id: "1", status: RefundStatus.REJECTED });
    });

    it("should throw 400 if rejecting with no notes", async () => {
      await expect(service.rejectRefund("1", "admin-1", "")).rejects.toThrow(BadRequestException);
    });

    it("should throw 400 if rejecting a non-PENDING refund", async () => {
      mockPrismaService.refund.findUnique.mockResolvedValue({ id: "1", status: RefundStatus.APPROVED });
      await expect(service.rejectRefund("1", "admin-1", "no")).rejects.toThrow(BadRequestException);
    });

    it("processRefund should process an APPROVED refund and update booking/payment", async () => {
      mockPrismaService.refund.findUnique.mockResolvedValue({ 
        id: "1", status: RefundStatus.APPROVED, paymentId: "p-1", bookingId: "b-1", booking: { status: BookingStatus.CONFIRMED }
      });
      mockPrismaService.refund.updateMany.mockResolvedValue({ count: 1 });
      mockPrismaService.refund.findUniqueOrThrow.mockResolvedValue({ id: "1", status: RefundStatus.PROCESSED });

      await expect(service.processRefund("1", "admin-1")).resolves.toEqual({ id: "1", status: RefundStatus.PROCESSED });

      expect(mockPrismaService.refund.updateMany).toHaveBeenCalledWith({
        where: { id: "1", status: RefundStatus.APPROVED },
        data: { status: RefundStatus.PROCESSED, processedAt: expect.any(Date) },
      });
      expect(mockPrismaService.payment.update).toHaveBeenCalledWith({
        where: { id: "p-1" },
        data: { status: PaymentStatus.REFUNDED },
      });
      expect(mockPrismaService.booking.update).toHaveBeenCalledWith({
        where: { id: "b-1" },
        data: { status: BookingStatus.CANCELLED, cancelledAt: expect.any(Date) },
      });
      expect(mockPrismaService.refundEvent.create).toHaveBeenCalledWith({
        data: {
          refundId: "1",
          fromStatus: RefundStatus.APPROVED,
          toStatus: RefundStatus.PROCESSED,
          actorUserId: "admin-1",
        },
      });
    });

    it("process on a COMPLETED booking marks Payment REFUNDED but leaves booking COMPLETED", async () => {
      mockPrismaService.refund.findUnique.mockResolvedValue({ 
        id: "1", status: RefundStatus.APPROVED, paymentId: "p-1", bookingId: "b-1", booking: { status: BookingStatus.COMPLETED }
      });
      mockPrismaService.refund.updateMany.mockResolvedValue({ count: 1 });
      mockPrismaService.refund.findUniqueOrThrow.mockResolvedValue({ id: "1", status: RefundStatus.PROCESSED });

      await expect(service.processRefund("1", "admin-1")).resolves.toEqual({ id: "1", status: RefundStatus.PROCESSED });

      expect(mockPrismaService.payment.update).toHaveBeenCalledWith({
        where: { id: "p-1" },
        data: { status: PaymentStatus.REFUNDED },
      });
      expect(mockPrismaService.booking.update).not.toHaveBeenCalled();
    });

    it("process on an already CANCELLED booking marks Payment REFUNDED but leaves booking CANCELLED", async () => {
      mockPrismaService.refund.findUnique.mockResolvedValue({ 
        id: "1", status: RefundStatus.APPROVED, paymentId: "p-1", bookingId: "b-1", booking: { status: BookingStatus.CANCELLED }
      });
      mockPrismaService.refund.updateMany.mockResolvedValue({ count: 1 });
      mockPrismaService.refund.findUniqueOrThrow.mockResolvedValue({ id: "1", status: RefundStatus.PROCESSED });

      await expect(service.processRefund("1", "admin-1")).resolves.toEqual({ id: "1", status: RefundStatus.PROCESSED });

      expect(mockPrismaService.payment.update).toHaveBeenCalledWith({
        where: { id: "p-1" },
        data: { status: PaymentStatus.REFUNDED },
      });
      expect(mockPrismaService.booking.update).not.toHaveBeenCalled();
    });

    it("processRefund should throw 400 on double-process race condition", async () => {
      mockPrismaService.refund.findUnique.mockResolvedValue({ 
        id: "1", status: RefundStatus.APPROVED, paymentId: "p-1", bookingId: "b-1", booking: { status: BookingStatus.CONFIRMED }
      });
      mockPrismaService.refund.updateMany.mockResolvedValue({ count: 0 }); // Double process!

      await expect(service.processRefund("1", "admin-1")).rejects.toThrow(BadRequestException);
    });
  });

  describe("ownership checks", () => {
    it("findRefundById should return refund for super admin", async () => {
      mockPrismaService.refund.findUnique.mockResolvedValue({ id: "1", booking: { hostUserId: "user-1" } });
      await expect(service.findRefundById("1", "admin-1", true)).resolves.toEqual(expect.objectContaining({ id: "1" }));
    });

    it("findRefundById should return refund for host user", async () => {
      mockPrismaService.refund.findUnique.mockResolvedValue({ id: "1", booking: { hostUserId: "user-1" } });
      await expect(service.findRefundById("1", "user-1", false)).resolves.toEqual(expect.objectContaining({ id: "1" }));
    });

    it("findRefundById should throw 404 for non-host user", async () => {
      mockPrismaService.refund.findUnique.mockResolvedValue({ id: "1", booking: { hostUserId: "user-1" } });
      await expect(service.findRefundById("1", "user-2", false)).rejects.toThrow(NotFoundException);
    });
  });
});
