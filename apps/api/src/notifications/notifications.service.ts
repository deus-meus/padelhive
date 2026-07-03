import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { NotificationType } from "@prisma/client";
import { MailService } from "../mail/mail.service";

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

@Injectable()
export class NotificationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService
  ) {}

  // Generic creator — will be used by other services in a later PR to emit notifications.
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
