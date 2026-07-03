import { Controller, Get, Patch, Param, Sse, MessageEvent, UseGuards } from "@nestjs/common";
import { NotificationsService } from "./notifications.service";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { RequestUser } from "../auth/types/request-user.type";
import { ApiTags, ApiBearerAuth, ApiOperation } from "@nestjs/swagger";
import { Observable, interval, merge } from "rxjs";
import { map } from "rxjs/operators";
import { Public } from "../auth/decorators/public.decorator";
import { SseFirebaseAuthGuard } from "../auth/guards/sse-firebase-auth.guard";

@ApiTags("Notifications")
@ApiBearerAuth()
@Controller("notifications")
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Sse("stream")
  @Public()
  @UseGuards(SseFirebaseAuthGuard)
  @ApiOperation({ summary: "Real-time notifications stream (SSE)" })
  stream(@CurrentUser() user: RequestUser): Observable<MessageEvent> {
    const notifications$ = this.notificationsService
      .streamForUser(user.id)
      .pipe(map((n) => ({ data: n, type: "notification" }) as MessageEvent));
    const heartbeat$ = interval(25000).pipe(
      map(() => ({ data: { ts: Date.now() }, type: "ping" }) as MessageEvent),
    );
    return merge(notifications$, heartbeat$);
  }

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
