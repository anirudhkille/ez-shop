import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { toast } from "sonner";

import { useUserStore } from "@/features/auth";
import { getErrorMessage } from "@/shared/lib/apiError";

import {
  deleteReview,
  getMyReview,
  getReviews,
  submitReview,
} from "../api/review";

export const useReviews = (productId: string) =>
  useQuery({
    queryKey: ["reviews", productId],
    queryFn: () => getReviews(productId),
    enabled: !!productId,
  });

export const useMyReview = (productId: string) => {
  const { token } = useUserStore();

  return useQuery({
    queryKey: ["my-review", productId],
    queryFn: () => getMyReview(productId),
    enabled: !!token && !!productId,
  });
};

const useInvalidateReviews = (productId: string) => {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: ["reviews", productId] });
    queryClient.invalidateQueries({ queryKey: ["my-review", productId] });
    queryClient.invalidateQueries({ queryKey: ["product-detail", productId] });
  };
};

export const useSubmitReview = (productId: string) => {
  const { token } = useUserStore();
  const invalidate = useInvalidateReviews(productId);

  return useMutation({
    mutationFn: (draft: { rating: number; comment?: string }) => {
      if (!token) {
        toast.error("Login to write a review");
        throw new Error("Not authenticated");
      }

      return submitReview(productId, draft);
    },
    onSuccess: (review) => {
      invalidate();
      toast.success(review.comment ? "Review published" : "Rating published");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Could not submit your review"));
    },
  });
};

export const useDeleteReview = (productId: string) => {
  const invalidate = useInvalidateReviews(productId);

  return useMutation({
    mutationFn: (reviewId: string) => deleteReview(reviewId),
    onSuccess: () => {
      invalidate();
      toast.success("Review deleted");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Could not delete your review"));
    },
  });
};
