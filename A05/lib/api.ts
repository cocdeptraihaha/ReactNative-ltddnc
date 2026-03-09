// export const API_BASE = "http://localhost:8000/api/v1";
export const API_BASE = "https://kebook.apn.leapcell.app/api/v1";
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

  const res = await fetch(`${API_BASE}${path}`, { ...init, headers });
  const data = await res.json().catch(() => ({}));

  if (res.status === 401 && token) {
    onUnauthorized?.();
  }

  if (!res.ok) {
    const detail =
      typeof data.detail === "string"
        ? data.detail
        : JSON.stringify(data.detail || data);
    throw new Error(detail);
  }

  return data as T;
}

export async function apiFormFetch<T>(
  path: string,
  body: Record<string, string>,
  options: RequestInit = {}
): Promise<T> {
  const formBody = new URLSearchParams(body).toString();
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      ...(options.headers as Record<string, string>),
    },
    body: formBody,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const detail =
      typeof data.detail === "string"
        ? data.detail
        : JSON.stringify(data.detail || data);
    throw new Error(detail);
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

  const data = (await res.json().catch(() => ({}))) as Partial<UploadAvatarResponse> & { detail?: unknown };
  if (res.status === 401) {
    onUnauthorized?.();
  }
  if (!res.ok) {
    const detail =
      typeof data.detail === "string" ? data.detail : JSON.stringify(data.detail ?? data);
    throw new Error(detail);
  }

  return data as UploadAvatarResponse;
}
