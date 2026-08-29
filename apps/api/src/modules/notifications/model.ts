import { t, Static } from "elysia";
import { NotificationType } from "@prisma/client";

export const NotificationTypeEnum = t.Enum(NotificationType);

export const NotificationSchema = t.Object({
  id: t.String(),
  userId: t.String(),
  type: NotificationTypeEnum,
  title: t.String(),
  body: t.String(),
  linkUrl: t.Nullable(t.String()),
  isRead: t.Boolean(),
  readAt: t.Nullable(t.Date()),
  createdAt: t.Date(),
});

export type NotificationModel = Static<typeof NotificationSchema>;
