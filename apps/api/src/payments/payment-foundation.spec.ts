import { BadRequestException, ForbiddenException, NotFoundException } from "@nestjs/common";
import { BookingStatus, CourtType, PaymentStatus } from "@prisma/client";
import { PaymentsService } from "./payments.service";

const booking = {
  id: "booking-1",
  finalAmount: 630000,
  status: BookingStatus.PENDING_PAYMENT,
};

const paymentResponse = {
  id: "payment-1",
  bookingId: "booking-1",
  amount: 630000,
  status: PaymentStatus.PENDING,
  provider: "internal",
  method: "va",
  providerReference: null,
  paidAt: null,
  failedAt: null,
  createdAt: new Date("2099-06-01T00:00:00.000Z"),
  updatedAt: new Date("2099-06-01T00:00:00.000Z"),
  booking: {
    id: "booking-1",
    bookingDate: new Date("2099-06-01T00:00:00.000Z"),
    startsAt: new Date("2099-06-01T09:00:00.000Z"),
    endsAt: new Date("2099-06-01T11:00:00.000Z"),
    durationMinutes: 120,
    status: BookingStatus.PENDING_PAYMENT,
    hostUserId: "user-1",
    venue: { id: "venue-1", name: "Padel Bali", city: "Bali" },
    court: { id: "court-1", name: "Court A", type: CourtType.OUTDOOR },
  },
};

function createPrisma(overrides: Record<string, unknown> = {}) {
  return {
    booking: { findFirst: jest.fn().mockResolvedValue(booking), update: jest.fn().mockResolvedValue({}) },
    payment: {
      findFirst: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue(paymentResponse),
      update: jest.fn().mockResolvedValue(paymentResponse),
      findUniqueOrThrow: jest.fn().mockResolvedValue(paymentResponse),
    },
    $transaction: jest.fn(async (callback) => callback({
      booking: { update: jest.fn().mockResolvedValue({}) },
      payment: { update: jest.fn().mockResolvedValue({ ...paymentResponse, status: PaymentStatus.PAID, paidAt: new Date("2099-06-01T01:00:00.000Z"), booking: { ...paymentResponse.booking, status: BookingStatus.CONFIRMED } }) },
    })),
    ...overrides,
  };
}

describe("Payment foundation", () => {
  it("creates a pending internal payment using booking finalAmount", async () => {
    const prisma = createPrisma();
    const mockGateway = { createTransaction: jest.fn() } as never;
    const service = new PaymentsService(prisma as never, mockGateway, { createNotification: jest.fn() } as never);

    const result = await service.createIntentForUser("user-1", { bookingId: "booking-1", provider: "internal", method: "va" });

    expect(prisma.booking.findFirst).toHaveBeenCalledWith({
      where: { id: "booking-1", hostUserId: "user-1" },
      select: { id: true, finalAmount: true, status: true },
    });
    expect(prisma.payment.create).toHaveBeenCalledWith({
      data: {
        bookingId: "booking-1",
        amount: 630000,
        status: PaymentStatus.PENDING,
        provider: "internal",
        method: "va",
      },
    });
    expect(result.amount).toBe(630000);
    expect(result.status).toBe(PaymentStatus.PENDING);
  });

  it("reuses an existing pending payment intent", async () => {
    const prisma = createPrisma({
      payment: { findFirst: jest.fn().mockResolvedValue(paymentResponse), create: jest.fn() },
    });
    const mockGateway = { createTransaction: jest.fn() } as never;
    const service = new PaymentsService(prisma as never, mockGateway, { createNotification: jest.fn() } as never);

    const result = await service.createIntentForUser("user-1", { bookingId: "booking-1", provider: "internal", method: "card" });

    expect(result.id).toBe("payment-1");
    expect(prisma.payment.create).not.toHaveBeenCalled();
  });

  it("rejects bookings not owned by the current user", async () => {
    const mockGateway = { createTransaction: jest.fn() } as never;
    const service = new PaymentsService(createPrisma({ booking: { findFirst: jest.fn().mockResolvedValue(null) } }) as never, mockGateway, { createNotification: jest.fn() } as never);

    await expect(service.createIntentForUser("user-2", { bookingId: "booking-1", provider: "internal", method: "va" })).rejects.toThrow(NotFoundException);
  });

  it("rejects unsupported methods and unpayable bookings", async () => {
    const mockGateway = { createTransaction: jest.fn() } as never;
    await expect(new PaymentsService(createPrisma() as never, mockGateway, { createNotification: jest.fn() } as never).createIntentForUser("user-1", { bookingId: "booking-1", provider: "internal", method: "cash" as never })).rejects.toThrow(BadRequestException);

    const service = new PaymentsService(createPrisma({ booking: { findFirst: jest.fn().mockResolvedValue({ ...booking, status: BookingStatus.CANCELLED }) } }) as never, mockGateway, { createNotification: jest.fn() } as never);
    await expect(service.createIntentForUser("user-1", { bookingId: "booking-1", provider: "internal", method: "va" })).rejects.toThrow(BadRequestException);
  });

  it("gets only payments owned by the current user", async () => {
    const prisma = createPrisma({ payment: { findFirst: jest.fn().mockResolvedValue(paymentResponse), create: jest.fn() } });
    const mockGateway = { createTransaction: jest.fn() } as never;
    const service = new PaymentsService(prisma as never, mockGateway, { createNotification: jest.fn() } as never);

    await expect(service.findPaymentForUser("payment-1", "user-1")).resolves.toMatchObject({ id: "payment-1" });
    expect(prisma.payment.findFirst).toHaveBeenCalledWith({
      where: { id: "payment-1", booking: { hostUserId: "user-1" } },
      select: expect.any(Object),
    });
  });

  it("lets the owner mark a pending demo payment as paid and confirms the booking", async () => {
    const txPaymentUpdate = jest.fn().mockResolvedValue({
      ...paymentResponse,
      status: PaymentStatus.PAID,
      paidAt: new Date("2099-06-01T01:00:00.000Z"),
      booking: { ...paymentResponse.booking, status: BookingStatus.CONFIRMED },
    });
    const txBookingUpdate = jest.fn().mockResolvedValue({});
    const prisma = createPrisma({
      payment: { findFirst: jest.fn().mockResolvedValue(paymentResponse), create: jest.fn(), update: jest.fn() },
      $transaction: jest.fn(async (callback) => callback({
        payment: { update: txPaymentUpdate },
        booking: { update: txBookingUpdate },
      })),
    });
    const mockGateway = { createTransaction: jest.fn() } as never;
    const service = new PaymentsService(prisma as never, mockGateway, { createNotification: jest.fn() } as never);

    const result = await service.markPaidForUser("payment-1", "user-1");

    expect(prisma.payment.findFirst).toHaveBeenCalledWith({
      where: { id: "payment-1" },
      select: expect.any(Object),
    });
    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    expect(txPaymentUpdate).toHaveBeenCalledWith({
      where: { id: "payment-1" },
      data: { status: PaymentStatus.PAID, paidAt: expect.any(Date) },
      select: expect.any(Object),
    });
    expect(txBookingUpdate).toHaveBeenCalledWith({
      where: { id: "booking-1" },
      data: { status: BookingStatus.CONFIRMED, expiresAt: null },
    });
    expect(result.status).toBe(PaymentStatus.PAID);
    expect(result.booking.status).toBe(BookingStatus.CONFIRMED);
  });

  it("rejects demo mark-paid when payment is missing", async () => {
    const mockGateway = { createTransaction: jest.fn() } as never;
    const service = new PaymentsService(createPrisma({
      payment: { findFirst: jest.fn().mockResolvedValue(null), create: jest.fn(), update: jest.fn() },
    }) as never, mockGateway, { createNotification: jest.fn() } as never);

    await expect(service.markPaidForUser("missing-payment", "user-1")).rejects.toThrow(NotFoundException);
  });

  it("rejects demo mark-paid when current user does not own the booking", async () => {
    const service = new PaymentsService(createPrisma({
      payment: {
        findFirst: jest.fn().mockResolvedValue({
          ...paymentResponse,
          booking: { ...paymentResponse.booking, hostUserId: "user-2" },
        }),
        create: jest.fn(),
        update: jest.fn(),
      },
    }) as never, { createTransaction: jest.fn() } as never, { createNotification: jest.fn() } as never);

    await expect(service.markPaidForUser("payment-1", "user-1")).rejects.toThrow(ForbiddenException);
  });

  it("rejects demo mark-paid when payment is not pending", async () => {
    const service = new PaymentsService(createPrisma({
      payment: {
        findFirst: jest.fn().mockResolvedValue({ ...paymentResponse, status: PaymentStatus.PAID }),
        create: jest.fn(),
        update: jest.fn(),
      },
    }) as never, { createTransaction: jest.fn() } as never, { createNotification: jest.fn() } as never);

    await expect(service.markPaidForUser("payment-1", "user-1")).rejects.toThrow(BadRequestException);
  });

  it("rejects demo mark-paid when booking is not pending payment", async () => {
    const service = new PaymentsService(createPrisma({
      payment: {
        findFirst: jest.fn().mockResolvedValue({
          ...paymentResponse,
          booking: { ...paymentResponse.booking, status: BookingStatus.CONFIRMED },
        }),
        create: jest.fn(),
        update: jest.fn(),
      },
    }) as never, { createTransaction: jest.fn() } as never, { createNotification: jest.fn() } as never);

    await expect(service.markPaidForUser("payment-1", "user-1")).rejects.toThrow(BadRequestException);
  });
});
