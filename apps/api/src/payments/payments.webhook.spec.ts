import { BadRequestException } from "@nestjs/common";
import { BookingStatus, PaymentStatus } from "@prisma/client";
import { PaymentsService } from "./payments.service";
import { MidtransWebhookDto } from "./dto/midtrans-webhook.dto";
import * as crypto from "crypto";

describe("Midtrans Webhook and Gateway integration", () => {
  const serverKey = "test-server-key";
  beforeAll(() => {
    process.env.MIDTRANS_SERVER_KEY = serverKey;
  });

  afterAll(() => {
    delete process.env.MIDTRANS_SERVER_KEY;
  });

  function generateSignature(orderId: string, statusCode: string, grossAmount: string): string {
    const hashString = `${orderId}${statusCode}${grossAmount}${serverKey}`;
    return crypto.createHash("sha512").update(hashString).digest("hex");
  }

  function createPrismaMock(payment: unknown = null) {
    return {
      payment: {
        findFirst: jest.fn().mockResolvedValue(payment),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        findUniqueOrThrow: jest.fn(),
      },
      booking: {
        findFirst: jest.fn(),
        update: jest.fn(),
      },
      $transaction: jest.fn(async (cb) => {
        const tx = {
          payment: { update: jest.fn() },
          booking: { update: jest.fn() },
        };
        await cb(tx);
      }),
    };
  }

  it("creates intent with midtrans gateway and stores redirect URL", async () => {
    const prisma = createPrismaMock();
    prisma.booking.findFirst.mockResolvedValue({ id: "booking-1", finalAmount: 100000, status: BookingStatus.PENDING_PAYMENT });
    prisma.payment.create.mockResolvedValue({ id: "payment-1" });
    prisma.payment.findUniqueOrThrow.mockResolvedValue({
      id: "payment-1",
      providerReference: "payment-1",
      providerRedirectUrl: "http://redirect",
      booking: { id: "booking-1" },
    });
    
    const gateway = {
      createTransaction: jest.fn().mockResolvedValue({
        providerReference: "payment-1",
        redirectUrl: "http://redirect",
      }),
    };

    const service = new PaymentsService(prisma as never, gateway as never);
    await service.createIntentForUser("user-1", { bookingId: "booking-1", provider: "midtrans", method: "va" });

    expect(gateway.createTransaction).toHaveBeenCalledWith({
      orderId: "payment-1",
      amount: 100000,
      method: "va",
    });
    expect(prisma.payment.update).toHaveBeenCalledWith({
      where: { id: "payment-1" },
      data: { providerReference: "payment-1", providerRedirectUrl: "http://redirect", providerToken: null },
    });
  });

  it("createIntent with midtrans gateway throwing does not leave a reusable orphaned PENDING payment", async () => {
    const prisma = createPrismaMock();
    prisma.booking.findFirst.mockResolvedValue({ id: "booking-1", finalAmount: 100000, status: BookingStatus.PENDING_PAYMENT });
    prisma.payment.create.mockResolvedValue({ id: "payment-1" });
    
    const gateway = {
      createTransaction: jest.fn().mockRejectedValue(new Error("Gateway down")),
    };

    const service = new PaymentsService(prisma as never, gateway as never);
    await expect(service.createIntentForUser("user-1", { bookingId: "booking-1", provider: "midtrans", method: "va" })).rejects.toThrow("Gateway down");

    expect(prisma.payment.create).toHaveBeenCalled();
    expect(gateway.createTransaction).toHaveBeenCalled();
    expect(prisma.payment.delete).toHaveBeenCalledWith({ where: { id: "payment-1" } });
  });

  it("rejects invalid signature length", async () => {
    const service = new PaymentsService(createPrismaMock() as never, {} as never);
    const payload = {
      order_id: "order-1",
      status_code: "200",
      gross_amount: "10000.00",
      signature_key: "short",
      transaction_status: "settlement",
    };
    await expect(service.handleMidtransWebhook(payload as MidtransWebhookDto)).rejects.toThrow(BadRequestException);
  });

  it("rejects invalid signature content", async () => {
    const service = new PaymentsService(createPrismaMock() as never, {} as never);
    const fakeHash = "a".repeat(128);
    const payload = {
      order_id: "order-1",
      status_code: "200",
      gross_amount: "10000.00",
      signature_key: fakeHash,
      transaction_status: "settlement",
    };
    await expect(service.handleMidtransWebhook(payload as MidtransWebhookDto)).rejects.toThrow(BadRequestException);
  });

  it("returns successfully (ignores) if payment not found (unknown order_id)", async () => {
    const prisma = createPrismaMock(null);
    const service = new PaymentsService(prisma as never, {} as never);
    
    const signature_key = generateSignature("unknown-order", "200", "10000.00");
    const payload = {
      order_id: "unknown-order",
      status_code: "200",
      gross_amount: "10000.00",
      signature_key,
      transaction_status: "settlement",
    };

    await expect(service.handleMidtransWebhook(payload as MidtransWebhookDto)).resolves.toBeUndefined();
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it("idempotency: returns successfully without updates if payment is already PAID", async () => {
    const payment = { id: "payment-1", status: PaymentStatus.PAID, booking: { status: BookingStatus.CONFIRMED } };
    const prisma = createPrismaMock(payment);
    const service = new PaymentsService(prisma as never, {} as never);
    
    const signature_key = generateSignature("payment-1", "200", "10000.00");
    const payload = {
      order_id: "payment-1",
      status_code: "200",
      gross_amount: "10000.00",
      signature_key,
      transaction_status: "settlement",
    };

    await expect(service.handleMidtransWebhook(payload as MidtransWebhookDto)).resolves.toBeUndefined();
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it("settlement webhook updates Payment to PAID and Booking to CONFIRMED", async () => {
    const payment = { id: "payment-1", status: PaymentStatus.PENDING, bookingId: "booking-1", booking: { id: "booking-1", status: BookingStatus.PENDING_PAYMENT } };
    const prisma = createPrismaMock(payment);
    let txPaymentUpdateMock: jest.Mock;
    let txBookingUpdateMock: jest.Mock;
    
    prisma.$transaction = jest.fn(async (cb) => {
      txPaymentUpdateMock = jest.fn();
      txBookingUpdateMock = jest.fn();
      await cb({ payment: { update: txPaymentUpdateMock }, booking: { update: txBookingUpdateMock } });
    });

    const service = new PaymentsService(prisma as never, {} as never);
    
    const signature_key = generateSignature("payment-1", "200", "10000.00");
    const payload = {
      order_id: "payment-1",
      status_code: "200",
      gross_amount: "10000.00",
      signature_key,
      transaction_status: "settlement",
    };

    await service.handleMidtransWebhook(payload as MidtransWebhookDto);
    expect(prisma.$transaction).toHaveBeenCalled();
    expect(txPaymentUpdateMock!).toHaveBeenCalledWith({
      where: { id: "payment-1" },
      data: { status: PaymentStatus.PAID, paidAt: expect.any(Date), failedAt: undefined },
    });
    expect(txBookingUpdateMock!).toHaveBeenCalledWith({
      where: { id: "booking-1" },
      data: { status: BookingStatus.CONFIRMED, expiresAt: null },
    });
  });

  it("settlement webhook for an already-CANCELLED booking marks Payment PAID but does not confirm the booking", async () => {
    const payment = { id: "payment-1", status: PaymentStatus.PENDING, bookingId: "booking-1", booking: { id: "booking-1", status: BookingStatus.CANCELLED } };
    const prisma = createPrismaMock(payment);
    let txPaymentUpdateMock: jest.Mock;
    let txBookingUpdateMock: jest.Mock;
    
    prisma.$transaction = jest.fn(async (cb) => {
      txPaymentUpdateMock = jest.fn();
      txBookingUpdateMock = jest.fn();
      await cb({ payment: { update: txPaymentUpdateMock }, booking: { update: txBookingUpdateMock } });
    });

    const service = new PaymentsService(prisma as never, {} as never);
    const warnMock = jest.spyOn((service as unknown as { logger: { warn: jest.Mock } }).logger, "warn").mockImplementation();
    
    const signature_key = generateSignature("payment-1", "200", "10000.00");
    const payload = {
      order_id: "payment-1",
      status_code: "200",
      gross_amount: "10000.00",
      signature_key,
      transaction_status: "settlement",
    };

    await service.handleMidtransWebhook(payload as MidtransWebhookDto);
    expect(prisma.$transaction).toHaveBeenCalled();
    expect(txPaymentUpdateMock!).toHaveBeenCalledWith({
      where: { id: "payment-1" },
      data: { status: PaymentStatus.PAID, paidAt: expect.any(Date), failedAt: undefined },
    });
    expect(txBookingUpdateMock!).not.toHaveBeenCalled();
    expect(warnMock).toHaveBeenCalledWith(
      "Settled payment landed on a non-payable booking and may need manual review/refund. Order ID: payment-1, Booking ID: booking-1, Current Booking Status: CANCELLED"
    );
    warnMock.mockRestore();
  });

  it("cancel webhook updates Payment to FAILED and leaves Booking unchanged", async () => {
    const payment = { id: "payment-1", status: PaymentStatus.PENDING, bookingId: "booking-1", booking: { id: "booking-1", status: BookingStatus.PENDING_PAYMENT } };
    const prisma = createPrismaMock(payment);
    let txPaymentUpdateMock: jest.Mock;
    let txBookingUpdateMock: jest.Mock;
    
    prisma.$transaction = jest.fn(async (cb) => {
      txPaymentUpdateMock = jest.fn();
      txBookingUpdateMock = jest.fn();
      await cb({ payment: { update: txPaymentUpdateMock }, booking: { update: txBookingUpdateMock } });
    });

    const service = new PaymentsService(prisma as never, {} as never);
    
    const signature_key = generateSignature("payment-1", "202", "10000.00");
    const payload = {
      order_id: "payment-1",
      status_code: "202",
      gross_amount: "10000.00",
      signature_key,
      transaction_status: "cancel",
    };

    await service.handleMidtransWebhook(payload as MidtransWebhookDto);
    expect(prisma.$transaction).toHaveBeenCalled();
    expect(txPaymentUpdateMock!).toHaveBeenCalledWith({
      where: { id: "payment-1" },
      data: { status: PaymentStatus.FAILED, paidAt: undefined, failedAt: expect.any(Date) },
    });
    expect(txBookingUpdateMock!).not.toHaveBeenCalled();
  });
});
