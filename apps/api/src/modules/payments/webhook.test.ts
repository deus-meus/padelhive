import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
  mock,
  spyOn,
} from "bun:test";
import * as crypto from "node:crypto";
import { BookingStatus, PaymentStatus } from "@prisma/client";
import { BadRequestException } from "../../common/errors";
import type { MidtransWebhookInput } from "./model";
import { PaymentsService } from "./service";

describe("Midtrans Webhook and Gateway integration", () => {
  const serverKey = "test-server-key";
  beforeAll(() => {
    process.env.MIDTRANS_SERVER_KEY = serverKey;
  });

  afterAll(() => {
    delete process.env.MIDTRANS_SERVER_KEY;
  });

  function generateSignature(
    orderId: string,
    statusCode: string,
    grossAmount: string,
  ): string {
    const hashString = `${orderId}${statusCode}${grossAmount}${serverKey}`;
    return crypto.createHash("sha512").update(hashString).digest("hex");
  }

  function createPrismaMock(payment: unknown = null) {
    return {
      bookingSplitShare: {
        count: mock().mockResolvedValue(0),
        findFirst: mock().mockResolvedValue(null),
        update: mock(),
      },
      bookingCharge: {
        findFirst: mock().mockResolvedValue(null),
        update: mock(),
      },
      payment: {
        findFirst: mock().mockResolvedValue(payment),
        create: mock(),
        update: mock(),
        delete: mock(),
        findUniqueOrThrow: mock(),
      },
      booking: {
        findFirst: mock(),
        update: mock(),
        findUnique: mock(),
      },
      $transaction: mock(async (cb: (tx: any) => any) => {
        const tx = {
          payment: { update: mock() },
          booking: { update: mock() },
        };
        await cb(tx);
      }),
    };
  }

  it("creates intent with midtrans gateway and stores redirect URL", async () => {
    const prisma = createPrismaMock();
    prisma.booking.findFirst.mockResolvedValue({
      id: "booking-1",
      finalAmount: 100000,
      status: BookingStatus.PENDING_PAYMENT,
    });
    prisma.payment.create.mockResolvedValue({ id: "payment-1" });
    prisma.payment.findUniqueOrThrow.mockResolvedValue({
      id: "payment-1",
      providerReference: "payment-1",
      providerRedirectUrl: "http://redirect",
      booking: { id: "booking-1" },
    });

    const gateway = {
      createTransaction: mock().mockResolvedValue({
        providerReference: "payment-1",
        redirectUrl: "http://redirect",
      }),
    };

    const service = new PaymentsService(
      prisma as never,
      gateway as never,
      { createNotification: mock() } as never,
    );
    await service.createIntentForUser("user-1", {
      bookingId: "booking-1",
      provider: "midtrans",
      method: "va",
    });

    expect(gateway.createTransaction).toHaveBeenCalledWith({
      orderId: "payment-1",
      amount: 100000,
      method: "va",
    });
    expect(prisma.payment.update).toHaveBeenCalledWith({
      where: { id: "payment-1" },
      data: {
        providerReference: "payment-1",
        providerRedirectUrl: "http://redirect",
        providerToken: null,
      },
    });
  });

  it("createIntent with midtrans gateway throwing does not leave a reusable orphaned PENDING payment", async () => {
    const prisma = createPrismaMock();
    prisma.booking.findFirst.mockResolvedValue({
      id: "booking-1",
      finalAmount: 100000,
      status: BookingStatus.PENDING_PAYMENT,
    });
    prisma.payment.create.mockResolvedValue({ id: "payment-1" });

    const gateway = {
      createTransaction: mock().mockRejectedValue(new Error("Gateway down")),
    };

    const service = new PaymentsService(
      prisma as never,
      gateway as never,
      { createNotification: mock() } as never,
    );
    expect(
      service.createIntentForUser("user-1", {
        bookingId: "booking-1",
        provider: "midtrans",
        method: "va",
      }),
    ).rejects.toThrow("Gateway down");

    expect(prisma.payment.create).toHaveBeenCalled();
    expect(gateway.createTransaction).toHaveBeenCalled();
    expect(prisma.payment.delete).toHaveBeenCalledWith({
      where: { id: "payment-1" },
    });
  });

  it("rejects invalid signature length", async () => {
    const service = new PaymentsService(
      createPrismaMock() as never,
      {} as never,
      { createNotification: mock() } as never,
    );
    const payload = {
      order_id: "order-1",
      status_code: "200",
      gross_amount: "10000.00",
      signature_key: "short",
      transaction_status: "settlement",
    };
    expect(
      service.handleMidtransWebhook(payload as MidtransWebhookInput),
    ).rejects.toThrow(BadRequestException);
  });

  it("rejects invalid signature content", async () => {
    const service = new PaymentsService(
      createPrismaMock() as never,
      {} as never,
      { createNotification: mock() } as never,
    );
    const fakeHash = "a".repeat(128);
    const payload = {
      order_id: "order-1",
      status_code: "200",
      gross_amount: "10000.00",
      signature_key: fakeHash,
      transaction_status: "settlement",
    };
    expect(
      service.handleMidtransWebhook(payload as MidtransWebhookInput),
    ).rejects.toThrow(BadRequestException);
  });

  it("returns successfully (ignores) if payment not found (unknown order_id)", async () => {
    const prisma = createPrismaMock(null);
    const service = new PaymentsService(
      prisma as never,
      {} as never,
      { createNotification: mock() } as never,
    );

    const signature_key = generateSignature("unknown-order", "200", "10000.00");
    const payload = {
      order_id: "unknown-order",
      status_code: "200",
      gross_amount: "10000.00",
      signature_key,
      transaction_status: "settlement",
    };

    expect(
      service.handleMidtransWebhook(payload as MidtransWebhookInput),
    ).resolves.toBeUndefined();
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it("idempotency: returns successfully without updates if payment is already PAID", async () => {
    const payment = {
      id: "payment-1",
      status: PaymentStatus.PAID,
      booking: { status: BookingStatus.CONFIRMED },
    };
    const prisma = createPrismaMock(payment);
    const service = new PaymentsService(
      prisma as never,
      {} as never,
      { createNotification: mock() } as never,
    );

    const signature_key = generateSignature("payment-1", "200", "10000.00");
    const payload = {
      order_id: "payment-1",
      status_code: "200",
      gross_amount: "10000.00",
      signature_key,
      transaction_status: "settlement",
    };

    expect(
      service.handleMidtransWebhook(payload as MidtransWebhookInput),
    ).resolves.toBeUndefined();
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it("settlement webhook updates Payment to PAID and Booking to CONFIRMED", async () => {
    const payment = {
      id: "payment-1",
      status: PaymentStatus.PENDING,
      bookingId: "booking-1",
      booking: { id: "booking-1", status: BookingStatus.PENDING_PAYMENT },
    };
    const prisma = createPrismaMock(payment);
    let txPaymentUpdateMock: any;
    let txBookingUpdateMock: any;

    prisma.$transaction = mock(async (cb: (tx: any) => any) => {
      txPaymentUpdateMock = mock();
      txBookingUpdateMock = mock();
      await cb({
        payment: { update: txPaymentUpdateMock },
        booking: { update: txBookingUpdateMock },
        bookingCharge: { updateMany: mock() },
      });
    });

    const service = new PaymentsService(
      prisma as never,
      {} as never,
      { createNotification: mock() } as never,
    );

    const signature_key = generateSignature("payment-1", "200", "10000.00");
    const payload = {
      order_id: "payment-1",
      status_code: "200",
      gross_amount: "10000.00",
      signature_key,
      transaction_status: "settlement",
    };

    await service.handleMidtransWebhook(payload as MidtransWebhookInput);
    expect(prisma.$transaction).toHaveBeenCalled();
    expect(txPaymentUpdateMock!).toHaveBeenCalledWith({
      where: { id: "payment-1" },
      data: {
        status: PaymentStatus.PAID,
        paidAt: expect.any(Date),
        failedAt: undefined,
      },
    });
    expect(txBookingUpdateMock!).toHaveBeenCalledWith({
      where: { id: "booking-1" },
      data: { status: BookingStatus.CONFIRMED, expiresAt: null },
    });
  });

  it("settlement webhook for an already-CANCELLED booking marks Payment PAID but does not confirm the booking", async () => {
    const payment = {
      id: "payment-1",
      status: PaymentStatus.PENDING,
      bookingId: "booking-1",
      booking: { id: "booking-1", status: BookingStatus.CANCELLED },
    };
    const prisma = createPrismaMock(payment);
    let txPaymentUpdateMock: any;
    let txBookingUpdateMock: any;

    prisma.$transaction = mock(async (cb: (tx: any) => any) => {
      txPaymentUpdateMock = mock();
      txBookingUpdateMock = mock();
      await cb({
        payment: { update: txPaymentUpdateMock },
        booking: { update: txBookingUpdateMock },
        bookingCharge: { updateMany: mock() },
      });
    });

    const service = new PaymentsService(
      prisma as never,
      {} as never,
      { createNotification: mock() } as never,
    );
    const warnMock = spyOn(console, "warn").mockImplementation(() => {});

    const signature_key = generateSignature("payment-1", "200", "10000.00");
    const payload = {
      order_id: "payment-1",
      status_code: "200",
      gross_amount: "10000.00",
      signature_key,
      transaction_status: "settlement",
    };

    await service.handleMidtransWebhook(payload as MidtransWebhookInput);
    expect(prisma.$transaction).toHaveBeenCalled();
    expect(txPaymentUpdateMock!).toHaveBeenCalledWith({
      where: { id: "payment-1" },
      data: {
        status: PaymentStatus.PAID,
        paidAt: expect.any(Date),
        failedAt: undefined,
      },
    });
    expect(txBookingUpdateMock!).not.toHaveBeenCalled();
    expect(warnMock).toHaveBeenCalledWith(
      expect.stringContaining(
        "Settled payment landed on a non-payable booking",
      ),
    );
    warnMock.mockRestore();
  });

  it("cancel webhook updates Payment to FAILED and leaves Booking unchanged", async () => {
    const payment = {
      id: "payment-1",
      status: PaymentStatus.PENDING,
      bookingId: "booking-1",
      booking: { id: "booking-1", status: BookingStatus.PENDING_PAYMENT },
    };
    const prisma = createPrismaMock(payment);
    let txPaymentUpdateMock: any;
    let txBookingUpdateMock: any;

    prisma.$transaction = mock(async (cb: (tx: any) => any) => {
      txPaymentUpdateMock = mock();
      txBookingUpdateMock = mock();
      await cb({
        payment: { update: txPaymentUpdateMock },
        booking: { update: txBookingUpdateMock },
        bookingCharge: { updateMany: mock() },
      });
    });

    const service = new PaymentsService(
      prisma as never,
      {} as never,
      { createNotification: mock() } as never,
    );

    const signature_key = generateSignature("payment-1", "202", "10000.00");
    const payload = {
      order_id: "payment-1",
      status_code: "202",
      gross_amount: "10000.00",
      signature_key,
      transaction_status: "cancel",
    };

    await service.handleMidtransWebhook(payload as MidtransWebhookInput);
    expect(prisma.$transaction).toHaveBeenCalled();
    expect(txPaymentUpdateMock!).toHaveBeenCalledWith({
      where: { id: "payment-1" },
      data: {
        status: PaymentStatus.FAILED,
        paidAt: undefined,
        failedAt: expect.any(Date),
      },
    });
    expect(txBookingUpdateMock!).not.toHaveBeenCalled();
  });

  it("settlement webhook for an order_id matching a BookingCharge marks it PAID", async () => {
    const prisma = createPrismaMock(null);
    prisma.bookingCharge.findFirst.mockResolvedValue({
      id: "charge-1",
      bookingId: "booking-1",
      status: PaymentStatus.PENDING,
    });
    prisma.booking.findUnique = mock().mockResolvedValue({
      id: "booking-1",
      hostUserId: "host-1",
    });

    const service = new PaymentsService(
      prisma as never,
      {} as never,
      { createNotification: mock() } as never,
    );

    const signature_key = generateSignature("charge-1", "200", "10000.00");
    const payload = {
      order_id: "charge-1",
      status_code: "200",
      gross_amount: "10000.00",
      signature_key,
      transaction_status: "settlement",
    };

    await service.handleMidtransWebhook(payload as MidtransWebhookInput);

    expect(prisma.bookingCharge.update).toHaveBeenCalledWith({
      where: { id: "charge-1" },
      data: {
        status: PaymentStatus.PAID,
        paidAt: expect.any(Date),
        failedAt: undefined,
      },
    });
  });
});
