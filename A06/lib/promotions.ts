import { API_BASE } from "./api";

export type PromotionPreviewResponse = {
  valid: boolean;
  message?: string;
  discount_amount: number;
  name?: string | null;
};

export async function previewPromotion(
  code: string,
  orderTotal: number,
  token?: string | null,
): Promise<PromotionPreviewResponse> {
  const trimmed = code.trim();
  if (!trimmed) {
    return { valid: false, message: undefined, discount_amount: 0 };
  }

  const params = new URLSearchParams({
    code: trimmed,
    order_total: String(orderTotal),
  });

  const url = `${API_BASE}/promotions/validate?${params.toString()}`;

  const headers: HeadersInit = {};
  if (token) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(url, { headers });
  let data: any = null;
  try {
    data = await res.json();
  } catch {
    // ignore parse error
  }

  if (!res.ok) {
    const msg =
      (data && typeof data.detail === "string" && data.detail) ||
      "Không thể kiểm tra mã giảm giá.";
    throw new Error(msg);
  }

  return {
    valid: Boolean(data?.valid),
    message: data?.message,
    discount_amount: Number(data?.discount_amount ?? 0),
    name: data?.name ?? null,
  };
}

