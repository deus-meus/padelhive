import { type Notification, NotificationType } from "@prisma/client";
import type { PrismaService } from "../../common/prisma";
import type { RedisService } from "../../common/redis";
import type { MailService } from "../mail/service";
import { NotificationsService } from "./service";

describe("NotificationsService", () => {
  let service: NotificationsService;
  let prisma: PrismaService;
  let mailService: MailService;
  let redisService: RedisService;

  beforeEach(() => {
    prisma = {
      notification: {
        create: jest.fn().mockImplementation(async (args) => {
          return { id: "notif-1", ...args.data };
        }),
        findMany: jest.fn().mockResolvedValue([]),
        findFirst: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
        count: jest.fn().mockResolvedValue(0),
      },
      user: {
        findUnique: jest.fn(),
      },
    } as unknown as PrismaService;

    mailService = {
      sendNotificationEmail: jest.fn().mockResolvedValue(undefined),
    } as unknown as MailService;

    redisService = {
      isEnabled: false,
      subscribe: jest.fn(),
      publish: jest.fn(),
    } as unknown as RedisService;

    service = new NotificationsService(prisma, mailService, redisService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("streamForUser", () => {
    it("should stream notifications to the correct user", async () => {
      const mockUserId = "user-123";
      const otherUserId = "user-456";

      const userReceivedEvents: Notification[] = [];
      const otherReceivedEvents: Notification[] = [];

      const userSub = service
        .streamForUser(mockUserId)
        .subscribe((n) => userReceivedEvents.push(n));
      const otherSub = service
        .streamForUser(otherUserId)
        .subscribe((n) => otherReceivedEvents.push(n));

      // Emit
      jest.spyOn(prisma.user, "findUnique").mockResolvedValue({
        email: "test@example.com",
        name: "Test User",
      } as any);
      await service.createNotification({
        userId: mockUserId,
        type: NotificationType.BOOKING_CONFIRMED,
        title: "Test Title",
        body: "Test Body",
      });

      // Cleanup subscriptions
      userSub.unsubscribe();
      otherSub.unsubscribe();

      expect(userReceivedEvents).toHaveLength(1);
      expect(userReceivedEvents[0].title).toBe("Test Title");
      expect(otherReceivedEvents).toHaveLength(0);
    });
  });

  describe("createNotification - email triggers", () => {
    it("calls mailService.sendNotificationEmail for allowlisted type when user has email", async () => {
      jest
        .spyOn(prisma.user, "findUnique")
        .mockResolvedValue({ email: "user@example.com", name: "User" } as any);

      const input = {
        userId: "user-1",
        type: NotificationType.BOOKING_CONFIRMED,
        title: "Confirmed",
        body: "Your booking is confirmed",
        linkUrl: "/bookings/123",
      };

      await service.createNotification(input);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: "user-1" },
        select: { email: true, name: true },
      });
      expect(mailService.sendNotificationEmail).toHaveBeenCalledWith({
        to: "user@example.com",
        toName: "User",
        type: NotificationType.BOOKING_CONFIRMED,
        title: "Confirmed",
        body: "Your booking is confirmed",
        linkUrl: "/bookings/123",
      });
    });

    it("does NOT call mailService for non-allowlisted type", async () => {
      const input = {
        userId: "user-1",
        type: "DISPUTE_CREATED" as any,
        title: "Dispute",
        body: "A dispute was created",
      };

      await service.createNotification(input);

      expect(prisma.user.findUnique).not.toHaveBeenCalled();
      expect(mailService.sendNotificationEmail).not.toHaveBeenCalled();
    });

    it("resolves and returns notification even if mailService throws", async () => {
      jest
        .spyOn(prisma.user, "findUnique")
        .mockResolvedValue({ email: "user@example.com", name: "User" } as any);
      jest
        .spyOn(mailService, "sendNotificationEmail")
        .mockRejectedValue(new Error("Send failed"));

      const input = {
        userId: "user-1",
        type: NotificationType.BOOKING_CONFIRMED,
        title: "Confirmed",
        body: "Your booking is confirmed",
      };

      const result = await service.createNotification(input);
      expect(result).toBeDefined();
      expect(result.id).toBe("notif-1");
    });
  });
});
