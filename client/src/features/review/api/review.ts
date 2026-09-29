import axiosInstance from "@/shared/lib/axiosInstance";

import type { TPagination, TReview, TReviewDraft } from "../types";

export const getReviews = async (
  productId: string,
  limit = 5
): Promise<{ reviews: TReview[]; pagination: TPagination }> => {
  const res = await axiosInstance.get(`/review/${productId}`, {
    params: { limit, page: 1 },
  });

  return { reviews: res.data.data, pagination: res.data.pagination };
};

export const getMyReview = async (productId: string): Promise<TReview | null> =>
  (await axiosInstance.get(`/review/mine/${productId}`)).data.data;

export const submitReview = async (
  productId: string,
  draft: TReviewDraft
): Promise<TReview> =>
  (await axiosInstance.post("/review", { productId, ...draft })).data.data;

export const deleteReview = async (reviewId: string): Promise<void> => {
  await axiosInstance.delete(`/review/${reviewId}`);
};
