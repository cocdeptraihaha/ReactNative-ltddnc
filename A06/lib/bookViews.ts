import { apiFetch } from "./api";
import type { Book } from "./books";

export async function recordBookView(token: string, bookId: number): Promise<void> {
  await apiFetch<unknown>(`/books/${bookId}/view`, { method: "POST", token });
}

export async function getRecentlyViewedBooks(
  token: string,
  limit = 20,
): Promise<Book[]> {
  return apiFetch<Book[]>(`/users/me/viewed?limit=${limit}`, { token });
}
