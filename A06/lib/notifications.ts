import { apiFetch } from "./api";

export type NotificationPayload = {
  id: number;
  title?: string | null;
  message?: string | null;
  type?: string | null;
  send_date?: string | null;
};

export type UserNotificationDto = {
  notification_id: number;
  user_id: number;
  is_read?: boolean | null;
  read_at?: string | null;
  notification?: NotificationPayload | null;
};

export type WsNewNotification = {
  type: "new_notification";
  schema_version?: number;
  id: number;
  title: string;
  message: string;
  notif_type: string;
  send_date: string | null;
  unread_count: number;
  /** Meta parsed server-side (order_id, book_id, …). */
  meta?: Record<string, string | number>;
};

export type WsUnreadSync = {
  type: "unread_sync";
  unread_count: number;
};

export function mapUserNotificationToRow(row: UserNotificationDto): {
  id: number;
  title: string;
  message: string;
  type: string;
  send_date: string | null;
  is_read: boolean;
} {
  const n = row.notification;
  return {
    id: row.notification_id,
    title: n?.title ?? "",
    message: n?.message ?? "",
    type: n?.type ?? "INFO",
    send_date: n?.send_date ?? null,
    is_read: Boolean(row.is_read),
  };
}

export async function getMyNotifications(
  token: string,
  skip = 0,
  limit = 100,
): Promise<UserNotificationDto[]> {
  const qs = new URLSearchParams({ skip: String(skip), limit: String(limit) });
  return apiFetch<UserNotificationDto[]>(`/notifications/me?${qs}`, { token });
}

export async function getUnreadCount(token: string): Promise<number> {
  const r = await apiFetch<{ count: number }>("/notifications/me/unread-count", { token });
  return r.count ?? 0;
}

export async function markNotificationRead(token: string, notificationId: number): Promise<void> {
  await apiFetch(`/notifications/${notificationId}/read`, { method: "POST", token });
}

/** Parse dòng `key:123` trong message (backend gắn meta). */
export function parseNotificationMeta(message: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const line of message.split("\n")) {
    const m = /^([a-zA-Z_]+):\s*(\d+)\s*$/.exec(line.trim());
    if (m) out[m[1]] = m[2];
  }
  return out;
}

export async function markAllNotificationsRead(token: string): Promise<number> {
  const r = await apiFetch<{ updated: number }>("/notifications/me/read-all", {
    method: "POST",
    token,
  });
  return r.updated ?? 0;
}
