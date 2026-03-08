const API_BASE = "https://kebook.apn.leapcell.app/api/v1";

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
