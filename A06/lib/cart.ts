import { apiFetch } from "./api";

export type CartItemWithBook = {
  id: number;
  book_id: number;
  quantity: number;
  title?: string | null;
  price?: number | null;
  original_price?: number | null;
  image_url?: string | null;
  stock_quantity?: number | null;
};

export type CartCreate = {
  book_id: number;
  quantity: number;
};

export async function addToCart(token: string, payload: CartCreate): Promise<CartItemWithBook> {
  return apiFetch<CartItemWithBook>("/cart", {
    method: "POST",
    body: JSON.stringify(payload),
    token,
  });
}

export async function getMyCart(token: string): Promise<CartItemWithBook[]> {
  return apiFetch<CartItemWithBook[]>("/cart/summary", {
    method: "GET",
    token,
  });
}

export async function updateCartQuantity(
  token: string,
  cartId: number,
  quantity: number,
): Promise<CartItemWithBook> {
  return apiFetch<CartItemWithBook>(`/cart/${cartId}`, {
    method: "PATCH",
    body: JSON.stringify({ quantity }),
    token,
  });
}

export async function removeCartItem(token: string, cartId: number): Promise<void> {
  await apiFetch<unknown>(`/cart/${cartId}`, {
    method: "DELETE",
    token,
  });
}

