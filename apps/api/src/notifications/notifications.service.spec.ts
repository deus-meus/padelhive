import { NotificationsService } from "./notifications.service";
import { NotificationType } from "@prisma/client";

describe("NotificationsService", () => {
  let service: NotificationsService;
  let prismaMock: any;
  let mailServiceMock: any;

  beforeEach(() => {
    prismaMock = {
      notification: {
        create: jest.fn().mockImplementation(async (args) => {
          return { id: "notif-1", ...args.data };
        }),
        findMany: jest.fn(),
        count: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
      },
      user: {
        findUnique: jest.fn(),
      },
    };

    mailServiceMock = {
      sendNotificationEmail: jest.fn().mockResolvedValue(undefined),
    };

    service = new NotificationsService(prismaMock, mailServiceMock);
  });

  describe("createNotification", () => {
    it("calls mailService exactly once with recipient email for allowlisted type", async () => {
      prismaMock.user.findUnique.mockResolvedValue({ email: "user@example.com", name: "User" });

      const input = {
        userId: "user-1",
        type: NotificationType.BOOKING_CONFIRMED,
        title: "Confirmed",
        body: "Your booking is confirmed",
        linkUrl: "/bookings/1",
      };

      const result = await service.createNotification(input);

      expect(result).toEqual(expect.objectContaining({ id: "notif-1", type: "BOOKING_CONFIRMED" }));
      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: { id: "user-1" },
        select: { email: true, name: true },
      });
      expect(mailServiceMock.sendNotificationEmail).toHaveBeenCalledTimes(1);
      expect(mailServiceMock.sendNotificationEmail).toHaveBeenCalledWith({
        to: "user@example.com",
        toName: "User",
        type: "BOOKING_CONFIRMED",
        title: "Confirmed",
        body: "Your booking is confirmed",
        linkUrl: "/bookings/1",
      });
    });

    it("does NOT call mailService for non-allowlisted type", async () => {
      const input = {
        userId: "user-1",
        // @ts-ignore - using a type not in the allowlist
        type: "DISPUTE_CREATED" as any,
        title: "Dispute",
        body: "A dispute was created",
      };

      await service.createNotification(input);

      expect(prismaMock.user.findUnique).not.toHaveBeenCalled();
      expect(mailServiceMock.sendNotificationEmail).not.toHaveBeenCalled();
    });

    it("resolves and returns notification even if mailService throws", async () => {
      prismaMock.user.findUnique.mockResolvedValue({ email: "user@example.com", name: "User" });
      mailServiceMock.sendNotificationEmail.mockRejectedValue(new Error("Send failed"));

      const input = {
        userId: "user-1",
        type: NotificationType.BOOKING_CONFIRMED,
        title: "Confirmed",
        body: "Your booking is confirmed",
      };

      const result = await service.createNotification(input);

      expect(result).toEqual(expect.objectContaining({ id: "notif-1" }));
      expect(mailServiceMock.sendNotificationEmail).toHaveBeenCalledTimes(1);
    });

    it("resolves and returns notification even if user.findUnique throws", async () => {
      prismaMock.user.findUnique.mockRejectedValue(new Error("DB error"));

      const input = {
        userId: "user-1",
        type: NotificationType.BOOKING_CONFIRMED,
        title: "Confirmed",
        body: "Your booking is confirmed",
      };

      const result = await service.createNotification(input);

      expect(result).toEqual(expect.objectContaining({ id: "notif-1" }));
      expect(prismaMock.user.findUnique).toHaveBeenCalledTimes(1);
      expect(mailServiceMock.sendNotificationEmail).not.toHaveBeenCalled();
    });
  });
});
