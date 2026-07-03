"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queries";
import {
  getNotifications,
  getUnreadNotificationCount,
  markNotificationRead,
  markAllNotificationsRead,
} from "@/lib/api";
import { useRouter } from "next/navigation";
import { Bell } from "lucide-react";
import { ErrorBanner, EmptyState } from "@/components/ui/error-state";
import { formatRelativeTime } from "@/lib/format";
import { NotificationIcon } from "@/components/shared/notification-icon";

export default function NotificationsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: unreadCount = 0 } = useQuery({
    queryKey: queryKeys.notifications.unreadCount(),
    queryFn: getUnreadNotificationCount,
  });

  const { data: notifications = [], isLoading, isError, error: queryError, refetch, isFetching } = useQuery({
    queryKey: queryKeys.notifications.list(),
    queryFn: getNotifications,
  });

  const markReadMutation = useMutation({
    mutationFn: markNotificationRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.list() });
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.unreadCount() });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.list() });
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.unreadCount() });
    },
  });

  const handleItemClick = (id: string, isRead: boolean, linkUrl: string | null) => {
    if (!isRead) {
      markReadMutation.mutate(id);
    }
    if (linkUrl) {
      router.push(linkUrl);
    }
  };

  const handleMarkAllRead = () => {
    if (unreadCount > 0) {
      markAllReadMutation.mutate();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pt-28">
        <section className="container pb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="heading-1 text-[#F7F7F7]">
                <span className="text-[#E6FA50]">Notifications</span>
              </h1>
              <p className="body-lg mt-2 text-[#F7F7F7]/40">
                Stay updated with your latest alerts.
              </p>
            </div>
            <button disabled className="label rounded-full border border-white/[0.08] px-5 py-2.5 text-[#F7F7F7]/60 opacity-40">
              Mark all as read
            </button>
          </div>
        </section>
        <section className="container pb-10">
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-24 w-full animate-pulse rounded-2xl border border-white/[0.06] bg-[#0C1B26]" />
            ))}
          </div>
        </section>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen pt-28">
        <section className="container pb-8">
          <h1 className="heading-1 text-[#F7F7F7]">
            <span className="text-[#E6FA50]">Notifications</span>
          </h1>
          <p className="body-lg mt-2 text-[#F7F7F7]/40">
            Stay updated with your latest alerts.
          </p>
        </section>
        <section className="container pb-section-sm">
          <ErrorBanner
            title="Couldn't load notifications"
            error={queryError}
            onRetry={() => refetch()}
            isRetrying={isFetching}
          />
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-28">
      <section className="container pb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="heading-1 text-[#F7F7F7]">
              <span className="text-[#E6FA50]">Notifications</span>
            </h1>
            <p className="body-lg mt-2 text-[#F7F7F7]/40">
              Stay updated with your latest alerts.
            </p>
          </div>
          <button
            onClick={handleMarkAllRead}
            disabled={unreadCount === 0 || markAllReadMutation.isPending}
            className="label rounded-full border border-white/[0.08] px-5 py-2.5 text-[#F7F7F7]/60 transition-colors hover:border-white/[0.15] hover:text-[#F7F7F7]/80 disabled:opacity-40"
          >
            Mark all as read
          </button>
        </div>
      </section>

      <section className="container pb-section-sm">
        <div className="space-y-3">
          {notifications.length === 0 ? (
            <EmptyState
              icon={Bell}
              title="You're all caught up"
              description="No new notifications to show."
            />
          ) : (
            notifications.map((n) => (
              <button
                key={n.id}
                onClick={() => handleItemClick(n.id, n.isRead, n.linkUrl)}
                className={`w-full flex items-start gap-4 rounded-xl border p-4 text-left transition-colors ${
                  !n.isRead ? "border-white/[0.06] bg-[#0C1B26]" : "border-white/[0.03] bg-white/[0.01]"
                } hover:bg-white/[0.03]`}
              >
                <div className="relative shrink-0">
                  <NotificationIcon type={n.type} />
                  {!n.isRead && (
                    <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-[#E6FA50]" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`label ${!n.isRead ? "text-[#F7F7F7]" : "text-[#F7F7F7]/60"}`}>{n.title}</p>
                  <p className={`caption mt-1 ${!n.isRead ? "text-[#F7F7F7]/60" : "text-[#F7F7F7]/40"}`}>
                    {n.body}
                  </p>
                  <p className="caption mt-1.5 text-[#F7F7F7]/25">
                    {formatRelativeTime(n.createdAt)}
                  </p>
                </div>
              </button>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
