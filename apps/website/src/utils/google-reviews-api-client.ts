import type { Studio } from "./studios";

export type GoogleReview = {
  review: string;
  writtenBy: string;
  writtenYear: string;
  writtenDate: string;
  rating: number;
  location?: string;
  reviewUrl?: string;
  source: "Google";
};

type GoogleReviewsResponse = {
  reviews?: GoogleReview[];
};

type GetGoogleReviewsInput =
  | number
  | {
      limit?: number;
      location?: Studio;
    };

const GOOGLE_REVIEWS_API_URL =
  "https://bookings.fizzkidz.com.au/api/reviews/google";
const GOOGLE_REVIEWS_FETCH_TIMEOUT_MS = 3_000;

export async function getGoogleReviews(input: GetGoogleReviewsInput = 12) {
  try {
    const limit = typeof input === "number" ? input : (input.limit ?? 12);
    const location = typeof input === "number" ? undefined : input.location;
    const url = new URL(GOOGLE_REVIEWS_API_URL);
    url.searchParams.set("limit", limit.toString());
    if (location) url.searchParams.set("location", location);

    const controller = new AbortController();
    const timeout = setTimeout(
      () => controller.abort(),
      GOOGLE_REVIEWS_FETCH_TIMEOUT_MS,
    );

    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (!response.ok) return [];

    const data = (await response.json()) as GoogleReviewsResponse;
    return data.reviews ?? [];
  } catch {
    return [];
  }
}
