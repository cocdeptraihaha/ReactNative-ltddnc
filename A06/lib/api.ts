/**
 * Một nơi cấu hình URL API cho toàn app. Ưu tiên biến môi trường (Expo):
 * tạo `A06/.env` từ `.env.example`, ví dụ:
 *   EXPO_PUBLIC_API_BASE=http://192.168.1.10:8000/api/v1
 * (phải có `http`/`https` và đoạn `/api/v1` ở cuối.)
 * Đổi .env cần restart `expo start` / Metro.
 */
const defaultApiBase = "https://kebook.apn.leapcell.app/api/v1";
const localApiBase = "http://localhost:8000/api/v1" ;
export const API_BASE = localApiBase;

/** Base WS (http→ws, https→wss), cùng path prefix với REST (/api/v1). */
export function getNotificationsWebSocketUrl(token: string): string {
  const wsBase = API_BASE.replace(/^http/, "ws").replace(/\/$/, "");
  return `${wsBase}/ws/notifications?token=${encodeURIComponent(token)}`;
}

export type UploadAvatarResponse = {
  url: string;
  avatar_url: string;
};

/** Gọi khi nhận 401 (token hết hạn) để logout tự động */
let onUnauthorized: (() => void) | null = null;
export function setOnUnauthorized(fn: () => void) {
  onUnauthorized = fn;
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit & { token?: string } = {}
): Promise<T> {
  const { token, ...init } = options;
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(init.headers as Record<string, string>),
  };
  if (token) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }

  const url = `${API_BASE}${path}`;
  let res: Response;
  try {
    res = await fetch(url, { ...init, headers });
  } catch (e) {
    throw new Error(
      `Network error. Cannot reach API.\nURL: ${url}\n${
        e instanceof Error ? e.message : String(e)
      }`,
    );
  }

  const contentType = res.headers.get("content-type") ?? "";
  const data =
    contentType.includes("application/json")
      ? await res.json().catch(() => ({}))
      : await res.text().catch(() => "");

  if (res.status === 401 && token) {
    onUnauthorized?.();
  }

  if (res.status === 204 || res.status === 205) {
    return undefined as T;
  }

  if (!res.ok) {
    const detail =
      typeof (data as any)?.detail === "string"
        ? (data as any).detail
        : typeof data === "string" && data
          ? data
          : JSON.stringify((data as any)?.detail || data);
    throw new Error(`HTTP ${res.status} ${res.statusText}\n${detail}`);
  }

  return data as T;
}

export async function apiFormFetch<T>(
  path: string,
  body: Record<string, string>,
  options: RequestInit = {}
): Promise<T> {
  const formBody = new URLSearchParams(body).toString();
  const url = `${API_BASE}${path}`;
  let res: Response;
  try {
    res = await fetch(url, {
    ...options,
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      ...(options.headers as Record<string, string>),
    },
    body: formBody,
    });
  } catch (e) {
    throw new Error(
      `Network error. Cannot reach API.\nURL: ${url}\n${
        e instanceof Error ? e.message : String(e)
      }`,
    );
  }

  const contentType = res.headers.get("content-type") ?? "";
  const data =
    contentType.includes("application/json")
      ? await res.json().catch(() => ({}))
      : await res.text().catch(() => "");

  if (!res.ok) {
    const detail =
      typeof (data as any)?.detail === "string"
        ? (data as any).detail
        : typeof data === "string" && data
          ? data
          : JSON.stringify((data as any)?.detail || data);
    throw new Error(`HTTP ${res.status} ${res.statusText}\n${detail}`);
  }

  return data as T;
}

export async function uploadAvatar(
  token: string,
  file: { uri: string; name: string; type: string },
): Promise<UploadAvatarResponse> {
  const form = new FormData();

  // Native (iOS/Android): dùng object đặc biệt { uri, name, type }
  // Web: phải chuyển sang Blob/File, nếu không browser stringify thành "[object Object]"
  if (typeof document === "undefined") {
    form.append("file", {
      uri: file.uri,
      name: file.name,
      type: file.type,
    } as any);
  } else {
    const resp = await fetch(file.uri);
    const blob = await resp.blob();
    form.append("file", blob, file.name);
  }

  const res = await fetch(`${API_BASE}/upload/avatar`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: form,
  });

  const data = (await res.json().catch(() => ({}))) as Partial<UploadAvatarResponse> & {
    detail?: unknown;
  };
  if (res.status === 401) {
    onUnauthorized?.();
  }
  if (!res.ok) {
    const detail =
      typeof data.detail === "string"
        ? data.detail
        : JSON.stringify(data.detail ?? data);
    throw new Error(detail);
  }

  return data as UploadAvatarResponse;
}
