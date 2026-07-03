import { BadRequestException, NotFoundException } from "@nestjs/common";
import { BookingStatus, PaymentStatus } from "@prisma/client";
import { BookingChargeService } from "./booking-charge.service";

describe("BookingChargeService", () => {
  let service: BookingChargeService;
  let prismaMock: any;
  let paymentGatewayMock: any;
  let safeNotifySpy: any;

  beforeEach(() => {
    prismaMock = {
      booking: { findFirst: jest.fn() },
      bookingCharge: { findFirst: jest.fn(), update: jest.fn() },
    };
    paymentGatewayMock = {
      createTransaction: jest.fn(),
    };
    service = new BookingChargeService(
      prismaMock as any,
      paymentGatewayMock as any,
      {} as any
    );
    safeNotifySpy = jest.spyOn(service as any, 'safeNotify').mockResolvedValue(undefined);
  });

  describe("createChargeIntent", () => {
    it("returns idempotent intent if already midtrans with ref/url", async () => {
      prismaMock.booking.findFirst.mockResolvedValue({ id: "booking-1" });
      const existingCharge = {
        id: "charge-1",
        bookingId: "booking-1",
        amount: 20000,
        status: PaymentStatus.PENDING,
        provider: "midtrans",
        method: "card",
        providerReference: "charge-1",
        providerRedirectUrl: "http://redirect",
        providerToken: "tok",
      };
      prismaMock.bookingCharge.findFirst.mockResolvedValue(existingCharge);

      const result = await service.createChargeIntent("booking-1", "user-1", "card");
      expect(result).toEqual(expect.objectContaining({ providerRedirectUrl: "http://redirect" }));
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
      paymentGatewayMock.createTransaction.mockResolvedValue({ redirectUrl: "http://new", token: "tok2" });
      prismaMock.bookingCharge.update.mockResolvedValue({
        ...pendingCharge,
        providerReference: "charge-1",
        providerRedirectUrl: "http://new",
        providerToken: "tok2",
      });

      const result = await service.createChargeIntent("booking-1", "user-1", "card");
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
      expect(prismaMock.bookingCharge.update).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({ status: PaymentStatus.PAID }),
      }));
      expect(result.status).toBe(PaymentStatus.PAID);
      expect(safeNotifySpy).toHaveBeenCalled();
    });
  });
});
