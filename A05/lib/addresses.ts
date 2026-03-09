import { API_BASE } from "./api";

export type ProvinceItem = { code: number; name: string };
export type WardItem = { code: number; name: string };

/** Danh sách tỉnh/thành (public, không cần token) */
export async function getProvinces(): Promise<ProvinceItem[]> {
  const res = await fetch(`${API_BASE}/addresses/provinces`);
  const data = await res.json().catch(() => []);
  if (!res.ok) throw new Error(typeof data.detail === "string" ? data.detail : "Failed to load provinces");
  return data;
}

/** Danh sách phường/xã theo tỉnh (public) */
export async function getWards(provinceId: number): Promise<WardItem[]> {
  const res = await fetch(`${API_BASE}/addresses/wards?province_id=${provinceId}`);
  const data = await res.json().catch(() => []);
  if (!res.ok) throw new Error(typeof data.detail === "string" ? data.detail : "Failed to load wards");
  return data;
}
