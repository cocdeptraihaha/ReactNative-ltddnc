import { apiFetch } from "./api";

export type LoyaltyBalance = { balance: number };

export type PointTransaction = {
  id: number;
  user_id: number;
  delta: number;
  reason: string;
  ref_type?: string | null;
  ref_id?: number | null;
  balance_after: number;
  created_at: string;
};

export async function getMyPoints(token: string): Promise<LoyaltyBalance> {
  return apiFetch<LoyaltyBalance>("/users/me/points", { token });
}

export async function getMyPointTransactions(
  token: string,
  params?: { skip?: number; limit?: number },
): Promise<PointTransaction[]> {
  const s = new URLSearchParams();
  if (params?.skip != null) s.set("skip", String(params.skip));
  if (params?.limit != null) s.set("limit", String(params.limit));
  const q = s.toString();
  return apiFetch<PointTransaction[]>(
    `/users/me/point-transactions${q ? `?${q}` : ""}`,
    { token },
  );
}
