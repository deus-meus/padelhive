"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queries";
import {
  getNotifications,
  getUnreadNotificationCount,
  markNotificationRead,
  markAllNotificationsRead,
} from "@/lib/api";

function formatRelativeTime(dateString: string) {
  const d = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);
  
  if (diffInSeconds < 60) return "Just now";
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;
  
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: d.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}

export function NotificationBell({ enabled }: { enabled: boolean }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const bellRef = useRef<HTMLDivElement>(null);

  const { data: unreadCount = 0 } = useQuery({
    queryKey: queryKeys.notifications.unreadCount(),
    queryFn: getUnreadNotificationCount,
    enabled,
    staleTime: 30_000,
    refetchInterval: 60_000,
  });

  const { data: notifications, isLoading } = useQuery({
    queryKey: queryKeys.notifications.list(),
    queryFn: getNotifications,
    enabled: enabled && open,
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

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleItemClick = (id: string, isRead: boolean, linkUrl: string | null) => {
    if (!isRead) {
      markReadMutation.mutate(id);
    }
    if (linkUrl) {
      setOpen(false);
      router.push(linkUrl);
    }
  };

  const handleMarkAllRead = () => {
    if (unreadCount > 0) {
      markAllReadMutation.mutate();
    }
  };

  if (!enabled) return null;

  return (
    <div ref={bellRef} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative flex h-9 w-9 items-center justify-center rounded-full text-[#F7F7F7]/60 transition-colors hover:bg-white/[0.05] hover:text-[#F7F7F7]"
        aria-label="Notifications"
      >
        <Bell className="h-[18px] w-[18px]" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#E6FA50] px-1 text-[10px] font-semibold leading-none text-[#06121A]">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 w-80 rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-2 shadow-2xl z-50">
          <div className="flex items-center justify-between px-3 py-2">
            <h3 className="text-sm font-medium text-[#F7F7F7]">Notifications</h3>
            <button
              onClick={handleMarkAllRead}
              disabled={unreadCount === 0 || markAllReadMutation.isPending}
              className="text-xs text-[#F7F7F7]/60 hover:text-[#F7F7F7] disabled:opacity-50 disabled:hover:text-[#F7F7F7]/60 transition-colors"
            >
              Mark all read
            </button>
          </div>
          <div className="border-t border-white/[0.04] my-1" />

          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="px-3 py-6 text-center text-sm text-[#F7F7F7]/40">
                Loading…
              </div>
            ) : notifications && notifications.length > 0 ? (
              <div className="flex flex-col gap-1 py-1">
                {notifications.map((n) => (
                  <button
                    key={n.id}
                    onClick={() => handleItemClick(n.id, n.isRead, n.linkUrl)}
                    className="flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-white/[0.03]"
                  >
                    {!n.isRead && (
                      <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#E6FA50]" />
                    )}
                    <div className={n.isRead ? "ml-5" : "ml-0"}>
                      <p className="text-sm font-medium text-[#F7F7F7]">{n.title}</p>
                      <p className="caption text-[#F7F7F7]/40 mt-0.5 leading-snug">
                        {n.body}
                      </p>
                      <p className="text-[10px] text-[#F7F7F7]/30 mt-1">
                        {formatRelativeTime(n.createdAt)}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="px-3 py-6 text-center text-sm text-[#F7F7F7]/40">
                No notifications yet.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
