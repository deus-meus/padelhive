import { NotificationType } from "@prisma/client";
import { type Static, t } from "elysia";

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
