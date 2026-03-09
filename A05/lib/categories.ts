import { apiFetch } from "./api";

export type Category = {
  id: number;
  name?: string | null;
  parent_id?: number | null;
};

let categoriesCache: Category[] | null = null;

export async function getCategories(): Promise<Category[]> {
  if (categoriesCache) return categoriesCache;
  const data = await apiFetch<Category[]>("/categories/?skip=0&limit=100");
  categoriesCache = data;
  return data;
}

