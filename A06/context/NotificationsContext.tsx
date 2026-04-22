import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useAuth } from "./AuthContext";
import { getNotificationsWebSocketUrl } from "../lib/api";
import {
  getMyNotifications,
  getUnreadCount,
  mapUserNotificationToRow,
  type WsNewNotification,
  type WsUnreadSync,
} from "../lib/notifications";

export type NotificationRow = {
  id: number;
  title: string;
  message: string;
  type: string;
  send_date: string | null;
  is_read: boolean;
};

type Ctx = {
  items: NotificationRow[];
  unreadCount: number;
  connected: boolean;
  refresh: () => Promise<void>;
  prependFromWs: (row: NotificationRow, unread: number) => void;
  setUnreadCount: (n: number) => void;
};

const NotificationsContext = createContext<Ctx | null>(null);

const HEARTBEAT_MS = 25_000;
const RECONNECT_BASE_MS = 1000;
const RECONNECT_MAX_MS = 30_000;

function parseWsPayload(raw: string): WsNewNotification | WsUnreadSync | null {
  try {
    const j = JSON.parse(raw) as { type?: string };
    if (j.type === "new_notification") return j as WsNewNotification;
    if (j.type === "unread_sync") return j as WsUnreadSync;
    if (j.type === "ping") return null;
    return null;
  } catch {
    return null;
  }
}

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const { token } = useAuth();
  const [items, setItems] = useState<NotificationRow[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [connected, setConnected] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttempt = useRef(0);
  const hbTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimers = useCallback(() => {
    if (hbTimer.current) {
      clearInterval(hbTimer.current);
      hbTimer.current = null;
    }
    if (reconnectTimer.current) {
      clearTimeout(reconnectTimer.current);
      reconnectTimer.current = null;
    }
  }, []);

  const refresh = useCallback(async () => {
    if (!token) {
      setItems([]);
      setUnreadCount(0);
      return;
    }
    try {
      const [list, count] = await Promise.all([
        getMyNotifications(token, 0, 100),
        getUnreadCount(token),
      ]);
      setItems(list.map(mapUserNotificationToRow));
      setUnreadCount(count);
    } catch {
      /* ignore */
    }
  }, [token]);

  const prependFromWs = useCallback((row: NotificationRow, unread: number) => {
    setItems((prev) => {
      const without = prev.filter((x) => x.id !== row.id);
      return [row, ...without];
    });
    setUnreadCount(unread);
  }, []);

  useEffect(() => {
    if (!token) {
      clearTimers();
      if (wsRef.current) {
        try {
          wsRef.current.close();
        } catch {
          /* */
        }
        wsRef.current = null;
      }
      setConnected(false);
      setItems([]);
      setUnreadCount(0);
      return;
    }

    let cancelled = false;

    const scheduleReconnect = () => {
      if (cancelled) return;
      const exp = Math.min(
        RECONNECT_MAX_MS,
        RECONNECT_BASE_MS * Math.pow(2, reconnectAttempt.current),
      );
      reconnectAttempt.current += 1;
      reconnectTimer.current = setTimeout(() => {
        if (!cancelled) connect();
      }, exp);
    };

    const connect = () => {
      if (cancelled) return;
      clearTimers();
      try {
        wsRef.current?.close();
      } catch {
        /* */
      }
      const url = getNotificationsWebSocketUrl(token);
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        if (cancelled) return;
        reconnectAttempt.current = 0;
        setConnected(true);
        hbTimer.current = setInterval(() => {
          try {
            if (ws.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify({ type: "ping" }));
            }
          } catch {
            /* */
          }
        }, HEARTBEAT_MS);
      };

      ws.onmessage = (ev) => {
        if (typeof ev.data !== "string") return;
        const parsed = parseWsPayload(ev.data);
        if (!parsed) return;
        if (parsed.type === "unread_sync") {
          setUnreadCount(parsed.unread_count);
          return;
        }
        if (parsed.type === "new_notification") {
          const row: NotificationRow = {
            id: parsed.id,
            title: parsed.title,
            message: parsed.message,
            type: parsed.notif_type,
            send_date: parsed.send_date,
            is_read: false,
          };
          prependFromWs(row, parsed.unread_count);
        }
      };

      ws.onerror = () => {
        /* RN often no detail */
      };

      ws.onclose = () => {
        if (cancelled) return;
        setConnected(false);
        clearTimers();
        wsRef.current = null;
        scheduleReconnect();
      };
    };

    void refresh();
    connect();

    return () => {
      cancelled = true;
      clearTimers();
      try {
        wsRef.current?.close();
      } catch {
        /* */
      }
      wsRef.current = null;
      setConnected(false);
    };
  }, [token, clearTimers, refresh, prependFromWs]);

  const value = useMemo<Ctx>(
    () => ({
      items,
      unreadCount,
      connected,
      refresh,
      prependFromWs,
      setUnreadCount,
    }),
    [items, unreadCount, connected, refresh, prependFromWs],
  );

  return (
    <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext);
  if (!ctx) {
    throw new Error("useNotifications must be used within NotificationsProvider");
  }
  return ctx;
}
