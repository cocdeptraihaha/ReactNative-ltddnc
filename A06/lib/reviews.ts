import { apiFetch } from "./api";

export type Review = {
  id: number;
  book_id?: number | null;
  user_id?: number | null;
  content?: string | null;
  rate?: number | null;
  create_at?: string | null;
  deleted_at?: string | null;
};

export type ReviewWithUser = Review & {
  user?: {
    id: number;
    full_name?: string | null;
    username?: string | null;
  } | null;
};

export type EligibilityResponse = {
  eligible: boolean;
  already_reviewed: boolean;
  last_delivered_at?: string | null;
  reward_points_on_submit?: number;
};

export type BookAvgRateOut = {
  book_id: number;
  avg_rate?: number | null;
  total_reviews: number;
};

export type ReviewCreatePayload = {
  book_id: number;
  content?: string | null;
  rate?: number | null;
};

export type ReviewUpdatePayload = {
  content?: string | null;
  rate?: number | null;
};

export async function listReviewsByBook(
  bookId: number,
  params?: { skip?: number; limit?: number },
): Promise<ReviewWithUser[]> {
  const skip = params?.skip ?? 0;
  const limit = params?.limit ?? 100;
  const q = new URLSearchParams({
    skip: String(skip),
    limit: String(limit),
  });
  return apiFetch<ReviewWithUser[]>(`/reviews/book/${bookId}?${q.toString()}`);
}

export async function getBookAvgAndCount(bookId: number): Promise<BookAvgRateOut> {
  return apiFetch<BookAvgRateOut>(`/reviews/book/${bookId}/avg`);
}

export async function getEligibility(
  token: string,
  bookId: number,
): Promise<EligibilityResponse> {
  return apiFetch<EligibilityResponse>(
    `/reviews/me/eligible?book_id=${encodeURIComponent(String(bookId))}`,
    { token },
  );
}

export async function getMyReviewByBook(token: string, bookId: number): Promise<Review> {
  return apiFetch<Review>(`/reviews/me/by-book/${bookId}`, { token });
}

export async function getMyReviewByBookOrNull(
  token: string,
  bookId: number,
): Promise<Review | null> {
  try {
    return await getMyReviewByBook(token, bookId);
  } catch (e) {
    if (e instanceof Error && /\b404\b/.test(e.message)) return null;
    throw e;
  }
}

export async function createReview(
  token: string,
  payload: ReviewCreatePayload,
): Promise<Review> {
  return apiFetch<Review>("/reviews/", {
    method: "POST",
    body: JSON.stringify(payload),
    token,
  });
}

export async function updateReview(
  token: string,
  reviewId: number,
  payload: ReviewUpdatePayload,
): Promise<Review> {
  return apiFetch<Review>(`/reviews/${reviewId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
    token,
  });
}

export async function deleteReview(token: string, reviewId: number): Promise<void> {
  await apiFetch<void>(`/reviews/${reviewId}`, {
    method: "DELETE",
    token,
  });
}
