import { apiFetch } from "./api";

export type PointReward = {
  id: number;
  name: string;
  cost_points: number;
  discount_percent: number;
  max_discount?: number | null;
  valid_days: number;
  active: boolean;
  created_at: string;
};

export type RedeemRewardResult = {
  promotion_id: number;
  code: string;
  name?: string | null;
  discount_percent?: number | null;
  max_discount?: number | null;
  end_date?: string | null;
  points_balance_after: number;
};

export async function listPointRewards(): Promise<PointReward[]> {
  return apiFetch<PointReward[]>("/points/rewards");
}

export async function redeemPointReward(
  token: string,
  rewardId: number,
): Promise<RedeemRewardResult> {
  return apiFetch<RedeemRewardResult>(`/points/rewards/${rewardId}/redeem`, {
    method: "POST",
    token,
  });
}
