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

export const NotificationResponseSchema = t.Object(
  {
    id: t.Optional(t.String()),
    userId: t.Optional(t.String()),
    type: t.Optional(NotificationTypeEnum),
    title: t.Optional(t.String()),
    body: t.Optional(t.String()),
    linkUrl: t.Optional(t.Nullable(t.String())),
    isRead: t.Optional(t.Boolean()),
    readAt: t.Optional(t.Nullable(t.Any())),
    createdAt: t.Optional(t.Any()),
  },
  { additionalProperties: true },
);

export type NotificationModel = Static<typeof NotificationSchema>;
