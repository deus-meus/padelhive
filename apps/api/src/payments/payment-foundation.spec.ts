import { BadRequestException, NotFoundException } from "@nestjs/common";
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
    booking: { findFirst: jest.fn().mockResolvedValue(booking) },
    payment: {
      findFirst: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue(paymentResponse),
    },
    ...overrides,
  };
}

describe("Payment foundation", () => {
  it("creates a pending internal payment using booking finalAmount", async () => {
    const prisma = createPrisma();
    const service = new PaymentsService(prisma as never);

    const result = await service.createIntentForUser("user-1", { bookingId: "booking-1", method: "va" });

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
      select: expect.any(Object),
    });
    expect(result.amount).toBe(630000);
    expect(result.status).toBe(PaymentStatus.PENDING);
  });

  it("reuses an existing pending payment intent", async () => {
    const prisma = createPrisma({
      payment: { findFirst: jest.fn().mockResolvedValue(paymentResponse), create: jest.fn() },
    });
    const service = new PaymentsService(prisma as never);

    const result = await service.createIntentForUser("user-1", { bookingId: "booking-1", method: "card" });

    expect(result.id).toBe("payment-1");
    expect(prisma.payment.create).not.toHaveBeenCalled();
  });

  it("rejects bookings not owned by the current user", async () => {
    const service = new PaymentsService(createPrisma({ booking: { findFirst: jest.fn().mockResolvedValue(null) } }) as never);

    await expect(service.createIntentForUser("user-2", { bookingId: "booking-1", method: "va" })).rejects.toThrow(NotFoundException);
  });

  it("rejects unsupported methods and unpayable bookings", async () => {
    await expect(new PaymentsService(createPrisma() as never).createIntentForUser("user-1", { bookingId: "booking-1", method: "cash" as never })).rejects.toThrow(BadRequestException);

    const service = new PaymentsService(createPrisma({ booking: { findFirst: jest.fn().mockResolvedValue({ ...booking, status: BookingStatus.CANCELLED }) } }) as never);
    await expect(service.createIntentForUser("user-1", { bookingId: "booking-1", method: "va" })).rejects.toThrow(BadRequestException);
  });

  it("gets only payments owned by the current user", async () => {
    const prisma = createPrisma({ payment: { findFirst: jest.fn().mockResolvedValue(paymentResponse), create: jest.fn() } });
    const service = new PaymentsService(prisma as never);

    await expect(service.findPaymentForUser("payment-1", "user-1")).resolves.toMatchObject({ id: "payment-1" });
    expect(prisma.payment.findFirst).toHaveBeenCalledWith({
      where: { id: "payment-1", booking: { hostUserId: "user-1" } },
      select: expect.any(Object),
    });
  });
});
