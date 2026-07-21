import { Test, TestingModule } from "@nestjs/testing";
import { NotificationsService } from "./notifications.service";
import { PrismaService } from "../prisma/prisma.service";
import { NotificationType, Notification } from "@prisma/client";
import { MailService } from "../mail/mail.service";
import { RedisService } from "../redis/redis.service";

describe("NotificationsService", () => {
  let service: NotificationsService;
  let prisma: PrismaService;
  let mailService: MailService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        {
          provide: PrismaService,
          useValue: {
            notification: {
              create: jest.fn().mockImplementation(async (args) => {
                return { id: "notif-1", ...args.data };
              }),
            },
            user: {
              findUnique: jest.fn(),
            },
          },
        },
        {
          provide: MailService,
          useValue: {
            sendNotificationEmail: jest.fn().mockResolvedValue(undefined),
          },
        },
        {
          provide: RedisService,
          useValue: {
            isEnabled: false,
            subscribe: jest.fn(),
            publish: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
    prisma = module.get<PrismaService>(PrismaService);
    mailService = module.get<MailService>(MailService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("streamForUser", () => {
    it("should stream notifications to the correct user", async () => {
      const mockUserId = "user-123";
      const otherUserId = "user-456";

      const mockNotification: Notification = {
        id: "notif-1",
        userId: mockUserId,
        type: NotificationType.BOOKING_CONFIRMED,
        title: "Test Title",
        body: "Test Body",
        linkUrl: null,
        isRead: false,
        readAt: null,
        createdAt: new Date(),
      };

      jest.spyOn(prisma.notification, "create").mockResolvedValue(mockNotification);

      const events: Notification[] = [];
      const otherEvents: Notification[] = [];

      const sub1 = service.streamForUser(mockUserId).subscribe((n) => events.push(n));
      const sub2 = service.streamForUser(otherUserId).subscribe((n) => otherEvents.push(n));

      await service.createNotification({
        userId: mockUserId,
        type: NotificationType.BOOKING_CONFIRMED,
        title: "Test Title",
        body: "Test Body",
      });

      expect(events).toHaveLength(1);
      expect(events[0]).toEqual(mockNotification);
      
      expect(otherEvents).toHaveLength(0);

      sub1.unsubscribe();
      sub2.unsubscribe();
    });
  });

  describe("createNotification", () => {
    it("calls mailService exactly once with recipient email for allowlisted type", async () => {
      jest.spyOn(prisma.user, "findUnique").mockResolvedValue({ email: "user@example.com", name: "User" } as any);

      const input = {
        userId: "user-1",
        type: NotificationType.BOOKING_CONFIRMED,
        title: "Confirmed",
        body: "Your booking is confirmed",
        linkUrl: "/bookings/1",
      };

      const result = await service.createNotification(input);

      expect(result).toEqual(expect.objectContaining({ id: "notif-1", type: "BOOKING_CONFIRMED" }));
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: "user-1" },
        select: { email: true, name: true },
      });
      expect(mailService.sendNotificationEmail).toHaveBeenCalledTimes(1);
      expect(mailService.sendNotificationEmail).toHaveBeenCalledWith({
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

      expect(prisma.user.findUnique).not.toHaveBeenCalled();
      expect(mailService.sendNotificationEmail).not.toHaveBeenCalled();
    });

    it("resolves and returns notification even if mailService throws", async () => {
      jest.spyOn(prisma.user, "findUnique").mockResolvedValue({ email: "user@example.com", name: "User" } as any);
      jest.spyOn(mailService, "sendNotificationEmail").mockRejectedValue(new Error("Send failed"));

      const input = {
        userId: "user-1",
        type: NotificationType.BOOKING_CONFIRMED,
        title: "Confirmed",
        body: "Your booking is confirmed",
      };

      const result = await service.createNotification(input);

      expect(result).toEqual(expect.objectContaining({ id: "notif-1" }));
      expect(mailService.sendNotificationEmail).toHaveBeenCalledTimes(1);
    });

    it("resolves and returns notification even if user.findUnique throws", async () => {
      jest.spyOn(prisma.user, "findUnique").mockRejectedValue(new Error("DB error"));

      const input = {
        userId: "user-1",
        type: NotificationType.BOOKING_CONFIRMED,
        title: "Confirmed",
        body: "Your booking is confirmed",
      };

      const result = await service.createNotification(input);

      expect(result).toEqual(expect.objectContaining({ id: "notif-1" }));
      expect(prisma.user.findUnique).toHaveBeenCalledTimes(1);
      expect(mailService.sendNotificationEmail).not.toHaveBeenCalled();
    });
  });
});
