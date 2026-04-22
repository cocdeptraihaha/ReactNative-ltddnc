import { apiFetch, API_BASE } from "./api";

export type Book = {
  id: number;
  title?: string | null;
  author?: string | null;
  selling_price?: number | null;
  original_price?: number | null;
  final_price?: number | null;
  discount_percent?: number | null;
  discount_amount?: number | null;
  has_discount?: boolean;
  image_url?: string | null;
  stock_quantity?: number | null;
  code?: string | null;
  edition?: number | null;
  publication_date?: string | null;
};

export type BookDetail = {
  id: number;
  description?: string | null;
  image_url?: string | null;
  pages?: number | null;
  publisher?: string | null;
  supplier?: string | null;
  height?: number | null;
  width?: number | null;
  length?: number | null;
  weight?: number | null;
};

export type BookWithDetail = Book & {
  book_detail?: BookDetail | null;
  buyer_count?: number;
  review_count?: number;
  view_count?: number;
};

export type Page<T> = {
  items: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
};

const booksCache = new Map<string, Page<Book>>();

export async function getBooks(params: {
  page?: number;
  size?: number;
  q?: string;
  categoryId?: number | null;
}): Promise<Page<Book>> {
  const page = params.page ?? 1;
  const size = params.size ?? 10;
  const q = (params.q ?? "").trim().toLowerCase();
  const categoryId = params.categoryId ?? null;

  const cacheKey = `${page}:${size}:${q}:${categoryId ?? ""}`;
  const cached = booksCache.get(cacheKey);
  if (cached) return cached;

  const search = new URLSearchParams();
  if (page) search.set("page", String(page));
  if (size) search.set("size", String(size));
  if (q) search.set("q", q);
  if (categoryId != null) search.set("category_id", String(categoryId));

  const query = search.toString();
  const path = `/books/${query ? `?${query}` : ""}`;
  const data = await apiFetch<Page<Book>>(path);
  booksCache.set(cacheKey, data);
  return data;
}

export async function getBook(id: number): Promise<BookWithDetail> {
  return apiFetch<BookWithDetail>(`/books/${id}`);
}

export async function getSimilarBooks(bookId: number, limit = 10): Promise<Book[]> {
  return apiFetch<Book[]>(`/books/${bookId}/similar?limit=${limit}`);
}

export async function getTopSellingBooks(limit = 10): Promise<Book[]> {
  const path = `/books/top-selling?limit=${limit}`;
  return apiFetch<Book[]>(path);
}

export async function getTopDiscountedBooks(limit = 20): Promise<Book[]> {
  const path = `/books/top-discounted?limit=${limit}`;
  return apiFetch<Book[]>(path);
}

// ── Admin APIs ─────────────────────────────────────────

export type CreateBookPayload = {
  title: string;
  author?: string | null;
  code?: string | null;
  edition?: number | null;
  publication_date?: string | null;
  selling_price?: number | null;
  stock_quantity?: number | null;
  book_detail?: {
    description?: string | null;
    pages?: number | null;
    publisher?: string | null;
    supplier?: string | null;
    height?: number | null;
    width?: number | null;
    length?: number | null;
    weight?: number | null;
  } | null;
};

export type CreatedBook = Book & {
  book_detail_id?: number | null;
};

export async function adminCreateBook(
  token: string,
  payload: CreateBookPayload,
): Promise<CreatedBook> {
  return apiFetch<CreatedBook>("/books/", {
    method: "POST",
    body: JSON.stringify(payload),
    token,
  });
}

export async function uploadBookImage(
  token: string,
  bookDetailId: number,
  file: { uri: string; name: string; type: string },
): Promise<{ image_url: string }> {
  const form = new FormData();
  if (typeof document === "undefined") {
    form.append("file", { uri: file.uri, name: file.name, type: file.type } as any);
  } else {
    const resp = await fetch(file.uri);
    const blob = await resp.blob();
    form.append("file", blob, file.name);
  }
  const res = await fetch(`${API_BASE}/upload/book-detail/${bookDetailId}/image`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as any)?.detail ?? "Upload failed");
  return data as { image_url: string };
}

