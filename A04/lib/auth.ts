import { apiFetch, apiFormFetch } from "./api";

export type User = {
  id: number;
  email: string;
  username?: string;
  full_name?: string;
  address?: string;
  province?: string;  // Thành phố/Tỉnh
  ward?: string;     // Phường/Xã
  is_active?: boolean;
  is_superuser?: boolean;
  avatar_url?: string;
  date_of_birth?: string | Date;
  gender?: string;
  phone_number?: string;
};

export type LoginResponse = {
  access_token: string;
  token_type: string;
  user: User;
};

export type RegisterResponse = {
  message: string;
  email: string;
};

export type VerifyOtpResponse = LoginResponse;

export async function login(username: string, password: string): Promise<LoginResponse> {
  return apiFormFetch<LoginResponse>("/auth/login", { username, password });
}

export async function register(data: {
  email: string;
  username: string;
  password: string;
  full_name: string;
}): Promise<RegisterResponse> {
  return apiFetch<RegisterResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function verifyOtp(email: string, otp_code: string): Promise<VerifyOtpResponse> {
  return apiFetch<VerifyOtpResponse>("/auth/verify-otp", {
    method: "POST",
    body: JSON.stringify({ email, otp_code }),
  });
}

export async function resendOtp(email: string): Promise<{ message: string }> {
  return apiFetch<{ message: string }>("/auth/resend-otp", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export async function forgotPassword(email: string): Promise<{ message: string }> {
  return apiFetch<{ message: string }>("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export async function resetPassword(
  email: string,
  otp_code: string,
  new_password: string
): Promise<{ message: string }> {
  return apiFetch<{ message: string }>("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({ email, otp_code, new_password }),
  });
}
