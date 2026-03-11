import { apiFetch } from "./api";

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

