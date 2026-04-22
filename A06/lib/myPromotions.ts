import { apiFetch } from "./api";

export type OwnedPromotion = {
  id: number;
  code: string | null;
  name: string | null;
  discount_percent: number | null;
  max_discount: number | null;
  start_date: string | null;
  end_date: string | null;
  used: boolean;
};

export async function getMyOwnedPromotions(
  token: string,
  unusedOnly = false,
): Promise<OwnedPromotion[]> {
  return apiFetch<OwnedPromotion[]>(
    `/users/me/promotions?unused_only=${unusedOnly ? "true" : "false"}`,
    { token },
  );
}
