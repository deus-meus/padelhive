import { Controller, Get, Patch, Param } from "@nestjs/common";
import { NotificationsService } from "./notifications.service";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { RequestUser } from "../auth/types/request-user.type";
import { ApiTags, ApiBearerAuth, ApiOperation } from "@nestjs/swagger";

@ApiTags("Notifications")
@ApiBearerAuth()
@Controller("notifications")
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: "Get my notifications" })
  findMine(@CurrentUser() user: RequestUser) {
    return this.notificationsService.findMyNotifications(user.id);
  }

  @Get("unread-count")
  @ApiOperation({ summary: "Get my unread notification count" })
  unreadCount(@CurrentUser() user: RequestUser) {
    return this.notificationsService.getUnreadCount(user.id);
  }

  @Patch("read-all")
  @ApiOperation({ summary: "Mark all my notifications as read" })
  markAllRead(@CurrentUser() user: RequestUser) {
    return this.notificationsService.markAllAsRead(user.id);
  }

  @Patch(":id/read")
  @ApiOperation({ summary: "Mark a notification as read" })
  markRead(@Param("id") id: string, @CurrentUser() user: RequestUser) {
    return this.notificationsService.markAsRead(id, user.id);
  }
}
