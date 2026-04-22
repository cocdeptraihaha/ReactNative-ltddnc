import { apiFetch } from "./api";
import type { Book } from "./books";

export async function addFavorite(token: string, bookId: number): Promise<void> {
  await apiFetch<{ ok: boolean }>(`/favorites/${bookId}`, { method: "POST", token });
}

export async function removeFavorite(token: string, bookId: number): Promise<void> {
  await apiFetch<unknown>(`/favorites/${bookId}`, { method: "DELETE", token });
}

export async function listMyFavorites(
  token: string,
  params?: { skip?: number; limit?: number },
): Promise<Book[]> {
  const s = new URLSearchParams();
  if (params?.skip != null) s.set("skip", String(params.skip));
  if (params?.limit != null) s.set("limit", String(params.limit));
  const q = s.toString();
  return apiFetch<Book[]>(`/favorites${q ? `?${q}` : ""}`, { token });
}

/** Trả map bookId -> đã yêu thích */
export async function checkFavorites(
  token: string,
  bookIds: number[],
): Promise<Record<number, boolean>> {
  if (!bookIds.length) return {};
  const raw = await apiFetch<Record<string, boolean>>(
    `/favorites/check?book_ids=${bookIds.join(",")}`,
    { token },
  );
  const out: Record<number, boolean> = {};
  for (const [k, v] of Object.entries(raw)) {
    out[Number(k)] = Boolean(v);
  }
  return out;
}
