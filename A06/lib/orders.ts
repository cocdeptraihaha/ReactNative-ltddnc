import { apiFetch } from "./api";

export type OrderItem = {
  id: number;
  book_id: number | null;
  quantity: number;
  price: number;
};

export type Order = {
  id: number;
  order_date?: string | null;
  status?: string | null;
  total_price?: number | null;
  phone_number?: string | null;
  shipping_address?: string | null;
  order_items?: OrderItem[];
};

export type CheckoutPayload = {
  note?: string | null;
  phone_number: string;
  shipping_address: string;
  promotion_code?: string | null;
};

export async function checkoutFromCart(
  token: string,
  payload: CheckoutPayload,
): Promise<Order> {
  return apiFetch<Order>("/orders/checkout", {
    method: "POST",
    body: JSON.stringify(payload),
    token,
  });
}

