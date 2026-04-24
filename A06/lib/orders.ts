import { apiFetch } from "./api";

export type OrderItem = {
  id: number;
  book_id: number | null;
  book_title?: string | null;
  quantity: number;
  price: number;
};

export type OrderStatusHistory = {
  id: number;
  status: string | null;
  status_change_date: string | null;
  description: string | null;
};

export type Order = {
  id: number;
  full_name?: string | null;
  order_date?: string | null;
  status?: string | null;
  total_price?: number | null;
  user_id?: number | null;
  phone_number?: string | null;
  shipping_address?: string | null;
  order_items?: OrderItem[];
  status_history?: OrderStatusHistory[];
};

export type OrderCheckoutSummary = {
  order: Order;
  item_amount: number;
  discount_total: number;
  shipping_fee: number;
  total_amount: number;
  loyalty_points_redeemed?: number;
  points_discount_amount?: number;
};

export type CheckoutItemPayload = {
  book_id: number;
  quantity: number;
};

export type CheckoutPayload = {
  full_name?: string | null;
  note?: string | null;
  phone_number: string;
  shipping_address: string;
  province?: string | null;
  ward?: string | null;
  promotion_code?: string | null;
  loyalty_points_to_redeem?: number | null;
  items?: CheckoutItemPayload[] | null;
};

export const STATUS_LABELS: Record<string, string> = {
  PENDING: "Đơn mới",
  CONFIRMED: "Xác nhận đơn",
  INPROGRESS: "Đã chuẩn bị hàng",
  SHIPPED: "Giao hàng",
  DELIVERED: "Đã giao",
  COMPLETED: "Hoàn thành",
  CANCELLED: "Hủy đơn",
  CANCEL_REQUESTED: "Yêu cầu hủy",
  RETURNED: "Trả hàng",
};

export const STATUS_COLORS: Record<string, string> = {
  PENDING: "#FB8C00",
  CONFIRMED: "#1E88E5",
  INPROGRESS: "#8E24AA",
  SHIPPED: "#00ACC1",
  DELIVERED: "#43A047",
  COMPLETED: "#2E7D32",
  CANCELLED: "#E53935",
  CANCEL_REQUESTED: "#F4511E",
  RETURNED: "#757575",
};

// ── User APIs ──────────────────────────────────────────

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

export async function getMyOrders(
  token: string,
  status?: string | null,
  statusIn?: string | null,
): Promise<Order[]> {
  const params = new URLSearchParams();
  if (statusIn) params.set("status_in", statusIn);
  else if (status) params.set("status", status);
  const qs = params.toString() ? `?${params}` : "";
  return apiFetch<Order[]>(`/orders${qs}`, { token });
}

export async function getOrderDetail(
  token: string,
  orderId: number,
): Promise<Order> {
  return apiFetch<Order>(`/orders/${orderId}`, { token });
}

export async function cancelOrder(
  token: string,
  orderId: number,
  reason?: string,
): Promise<Order> {
  return apiFetch<Order>(`/orders/${orderId}/cancel`, {
    method: "POST",
    body: JSON.stringify({ reason: reason || null }),
    token,
  });
}

// ── Admin APIs ─────────────────────────────────────────

export async function adminListOrders(
  token: string,
  status?: string | null,
): Promise<Order[]> {
  const qs = status ? `?status=${encodeURIComponent(status)}` : "";
  return apiFetch<Order[]>(`/orders/admin/all${qs}`, { token });
}

export async function adminGetOrder(
  token: string,
  orderId: number,
): Promise<Order> {
  return apiFetch<Order>(`/orders/admin/${orderId}`, { token });
}

export async function adminUpdateOrderStatus(
  token: string,
  orderId: number,
  status: string,
  description?: string,
): Promise<Order> {
  return apiFetch<Order>(`/orders/admin/${orderId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status, description: description || null }),
    token,
  });
}
