import { apiFetch } from "./api";
import type { User } from "./auth";

export async function getMe(token: string): Promise<User> {
  return apiFetch<User>("/users/me", { token });
}

export type UpdateMeInput = Partial<
  Pick<
    User,
    "email" | "username" | "full_name" | "address" | "province" | "ward" | "avatar_url" | "date_of_birth" | "gender" | "phone_number"
  >
>;

export async function updateMe(token: string, userId: number, data: UpdateMeInput): Promise<User> {
  return apiFetch<User>(`/users/${userId}`, {
    token,
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

