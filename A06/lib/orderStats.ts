import { apiFetch } from "./api";

export type MoneyBucket = {
  count: number;
  total: number;
};

export type OrderMoneyStats = {
  pending_confirm: MoneyBucket;
  shipping: MoneyBucket;
  delivered: MoneyBucket;
  cancelled: MoneyBucket;
  total_spent: number;
};

function toYmd(d: Date): string {
  const y = d.getFullYear();
  const m = (d.getMonth() + 1).toString().padStart(2, "0");
  const day = d.getDate().toString().padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export async function getMyOrderStats(
  token: string,
  opts?: { from?: Date; to?: Date },
): Promise<OrderMoneyStats> {
  const params = new URLSearchParams();
  if (opts?.from) params.set("from", toYmd(opts.from));
  if (opts?.to) params.set("to", toYmd(opts.to));
  const qs = params.toString() ? `?${params}` : "";
  return apiFetch<OrderMoneyStats>(`/orders/me/stats${qs}`, { token });
}
