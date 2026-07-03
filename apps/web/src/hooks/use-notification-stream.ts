"use client";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queries";
import { API_URL } from "@/lib/api";
import { getIdToken } from "@/lib/auth-client";

export function useNotificationStream(enabled: boolean) {
  const queryClient = useQueryClient();
  useEffect(() => {
    if (!enabled) return;
    let es: EventSource | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    let closed = false;

    const invalidate = () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.unreadCount() });
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.list() });
    };

    const connect = async () => {
      if (closed) return;
      let token: string | null = null;
      try { token = await getIdToken(); } catch { token = null; }
      if (!token) { scheduleReconnect(); return; }
      const url = `${API_URL}/notifications/stream?token=${encodeURIComponent(token)}`;
      es = new EventSource(url);
      es.addEventListener("notification", () => invalidate());
      es.onerror = () => {
        es?.close();
        es = null;
        scheduleReconnect();
      };
    };

    const scheduleReconnect = () => {
      if (closed || reconnectTimer) return;
      reconnectTimer = setTimeout(() => {
        reconnectTimer = null;
        void connect(); // fetches a FRESH token, handling ~1h Firebase token expiry
      }, 5000);
    };

    void connect();

    return () => {
      closed = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      es?.close();
    };
  }, [enabled, queryClient]);
}
