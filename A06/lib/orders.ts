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

export type OrderCheckoutSummary = {
  order: Order;
  item_amount: number;
  discount_total: number;
  shipping_fee: number;
  total_amount: number;
};

export type CheckoutItemPayload = {
  book_id: number;
  quantity: number;
};

export type CheckoutPayload = {
  note?: string | null;
  phone_number: string;
  shipping_address: string;
  province?: string | null;
  ward?: string | null;
  promotion_code?: string | null;
  items?: CheckoutItemPayload[] | null;
};

export async function checkoutFromCart(
  token: string,
  payload: CheckoutPayload,
): Promise<OrderCheckoutSummary> {
  return apiFetch<OrderCheckoutSummary>("/orders/checkout", {
    method: "POST",
    body: JSON.stringify(payload),
    token,
  });
}

