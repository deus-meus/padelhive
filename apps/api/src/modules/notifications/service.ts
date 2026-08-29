import { NotificationType, Notification } from "@prisma/client";
import { PrismaService, prisma as defaultPrisma } from "../../common/prisma";
import { MailService, mailService as defaultMail } from "../mail/service";
import { RedisService, redisService as defaultRedis } from "../../common/redis";
import { Subject, Observable } from "rxjs";
import { filter, map } from "rxjs/operators";
import { NotFoundException } from "../../common/errors";

export type CreateNotificationInput = {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  linkUrl?: string;
};

const EMAIL_NOTIFICATION_TYPES = new Set<NotificationType>([
  NotificationType.BOOKING_CONFIRMED,
  NotificationType.BOOKING_CANCELLED,
  NotificationType.PAYMENT_SUCCESS,
  NotificationType.PAYMENT_FAILED,
  NotificationType.REFUND_REQUESTED,
  NotificationType.REFUND_APPROVED,
  NotificationType.REFUND_REJECTED,
  NotificationType.REFUND_PROCESSED,
  NotificationType.BALANCE_DUE,
]);

export class NotificationsService {
  private readonly notificationStream = new Subject<{ userId: string; notification: Notification }>();
  private readonly NOTIFICATIONS_CHANNEL = "notifications:stream";

  constructor(
    private readonly prisma: PrismaService = defaultPrisma,
    private readonly mailService: MailService = defaultMail,
    private readonly redis: RedisService = defaultRedis
  ) {
    if (this.redis.isEnabled) {
      this.redis.subscribe(this.NOTIFICATIONS_CHANNEL, (message) => {
        try {
          const parsed = JSON.parse(message);
          this.notificationStream.next(parsed);
        } catch (err) {
          // ignore
        }
      });
    }
  }

  async createNotification(input: CreateNotificationInput) {
    const notification = await this.prisma.notification.create({
      data: {
        userId: input.userId,
        type: input.type,
        title: input.title,
        body: input.body,
        linkUrl: input.linkUrl,
      },
    });

    if (this.redis.isEnabled) {
      try {
        await this.redis.publish(
          this.NOTIFICATIONS_CHANNEL,
          JSON.stringify({ userId: input.userId, notification })
        );
      } catch (err) {
        this.notificationStream.next({ userId: input.userId, notification });
      }
    } else {
      this.notificationStream.next({ userId: input.userId, notification });
    }

    if (EMAIL_NOTIFICATION_TYPES.has(input.type)) {
      try {
        const user = await this.prisma.user.findUnique({
          where: { id: input.userId },
          select: { email: true, name: true },
        });

        if (user && user.email) {
          await this.mailService.sendNotificationEmail({
            to: user.email,
            toName: user.name ?? undefined,
            type: input.type,
            title: input.title,
            body: input.body,
            linkUrl: input.linkUrl,
          });
        }
      } catch (err) {
        // best effort, swallow db error
      }
    }

    return notification;
  }

  streamForUser(userId: string): Observable<Notification> {
    return this.notificationStream.asObservable().pipe(
      filter((event) => event.userId === userId),
      map((event) => event.notification),
    );
  }

  async findMyNotifications(userId: string) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
  }

  async getUnreadCount(userId: string) {
    const count = await this.prisma.notification.count({
      where: { userId, isRead: false },
    });
    return { count };
  }

  async markAsRead(id: string, userId: string) {
    const notification = await this.prisma.notification.findFirst({ where: { id, userId } });
    if (!notification) {
      throw new NotFoundException("Notification not found");
    }
    if (notification.isRead) {
      return notification;
    }
    return this.prisma.notification.update({
      where: { id },
      data: { isRead: true, readAt: new Date() },
    });
  }

  async markAllAsRead(userId: string) {
    const result = await this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });
    return { updated: result.count };
  }
}

export const notificationsService = new NotificationsService();
