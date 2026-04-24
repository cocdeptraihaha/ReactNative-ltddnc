import { apiFetch } from "./api";

export type ReturnRequestStatus = "PENDING" | "APPROVED" | "REJECTED";

export type ReturnRequest = {
  id: number;
  order_id: number;
  order_item_id: number;
  quantity: number;
  reason?: string | null;
  request_date?: string | null;
  processed_date?: string | null;
  status: ReturnRequestStatus;
  processed_by?: number | null;
};

export type CreateReturnRequestPayload = {
  order_id: number;
  order_item_id: number;
  quantity: number;
  reason?: string | null;
};

export async function getMyReturnRequests(token: string): Promise<ReturnRequest[]> {
  return apiFetch<ReturnRequest[]>("/return-requests", { token });
}

export async function createReturnRequest(
  token: string,
  payload: CreateReturnRequestPayload,
): Promise<ReturnRequest> {
  return apiFetch<ReturnRequest>("/return-requests", {
    method: "POST",
    token,
    body: JSON.stringify(payload),
  });
}

