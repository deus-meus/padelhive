import { Test, TestingModule } from "@nestjs/testing";
import { NotificationsService } from "./notifications.service";
import { PrismaService } from "../prisma/prisma.service";
import { NotificationType, Notification } from "@prisma/client";

describe("NotificationsService", () => {
  let service: NotificationsService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        {
          provide: PrismaService,
          useValue: {
            notification: {
              create: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
    prisma = module.get<PrismaService>(PrismaService);
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
});
