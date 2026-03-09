import { apiFetch } from "./api";

export type Book = {
  id: number;
  title?: string | null;
  author?: string | null;
  selling_price?: number | null;
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

export async function getBooks(params: {
  page?: number;
  size?: number;
  q?: string;
}): Promise<Page<Book>> {
  const search = new URLSearchParams();
  if (params.page) search.set("page", String(params.page));
  if (params.size) search.set("size", String(params.size));
  if (params.q && params.q.trim()) search.set("q", params.q.trim());

  const query = search.toString();
  const path = `/books/${query ? `?${query}` : ""}`;
  return apiFetch<Page<Book>>(path);
}

export async function getBook(id: number): Promise<BookWithDetail> {
  return apiFetch<BookWithDetail>(`/books/${id}`);
}

