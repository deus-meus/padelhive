import { beforeEach, describe, expect, it, mock } from "bun:test";
import { PaymentStatus } from "@prisma/client";
import { BookingChargeService } from "./charge.service";

describe("BookingChargeService", () => {
  let service: BookingChargeService;
  let prismaMock: any;
  let paymentGatewayMock: any;

  beforeEach(() => {
    prismaMock = {
      booking: { findFirst: mock() },
      bookingCharge: { findFirst: mock(), update: mock() },
    };
    paymentGatewayMock = {
      createTransaction: mock(),
    };
    service = new BookingChargeService(
      prismaMock as any,
      paymentGatewayMock as any,
    );
  });

  describe("createChargeIntent", () => {
    it("returns idempotent intent if charge already has ref/url regardless of provider", async () => {
      prismaMock.booking.findFirst.mockResolvedValue({ id: "booking-1" });
      const existingCharge = {
        id: "charge-1",
        bookingId: "booking-1",
        amount: 20000,
        status: PaymentStatus.PENDING,
        provider: "stripe",
        method: "card",
        providerReference: "charge-1",
        providerRedirectUrl: "http://redirect",
        providerToken: "tok",
      };
      prismaMock.bookingCharge.findFirst.mockResolvedValue(existingCharge);

      const result = await service.createChargeIntent(
        "booking-1",
        "user-1",
        "card",
      );
      expect(result).toEqual(
        expect.objectContaining({ providerRedirectUrl: "http://redirect" }),
      );
      expect(paymentGatewayMock.createTransaction).not.toHaveBeenCalled();
    });

    it("creates new transaction and updates charge", async () => {
      prismaMock.booking.findFirst.mockResolvedValue({ id: "booking-1" });
      const pendingCharge = {
        id: "charge-1",
        bookingId: "booking-1",
        amount: 20000,
        status: PaymentStatus.PENDING,
        provider: "internal",
        method: "card",
      };
      prismaMock.bookingCharge.findFirst.mockResolvedValue(pendingCharge);
      paymentGatewayMock.createTransaction.mockResolvedValue({
        redirectUrl: "http://new",
        token: "tok2",
      });
      prismaMock.bookingCharge.update.mockResolvedValue({
        ...pendingCharge,
        providerReference: "charge-1",
        providerRedirectUrl: "http://new",
        providerToken: "tok2",
      });

      const result = await service.createChargeIntent(
        "booking-1",
        "user-1",
        "card",
      );
      expect(paymentGatewayMock.createTransaction).toHaveBeenCalledWith({
        orderId: "charge-1",
        amount: 20000,
        method: "card",
      });
      expect(result.providerRedirectUrl).toBe("http://new");
    });
  });

  describe("markChargePaidForUser", () => {
    it("sets charge status to PAID", async () => {
      prismaMock.booking.findFirst.mockResolvedValue({ id: "booking-1" });
      prismaMock.bookingCharge.findFirst.mockResolvedValue({
        id: "charge-1",
        bookingId: "booking-1",
        status: PaymentStatus.PENDING,
      });
      prismaMock.bookingCharge.update.mockResolvedValue({
        id: "charge-1",
        bookingId: "booking-1",
        status: PaymentStatus.PAID,
      });

      const result = await service.markChargePaidForUser("booking-1", "user-1");
      expect(prismaMock.bookingCharge.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: PaymentStatus.PAID }),
        }),
      );
      expect(result.status).toBe(PaymentStatus.PAID);
    });
  });
});
