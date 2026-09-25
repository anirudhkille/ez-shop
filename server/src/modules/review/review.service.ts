import { AppError } from "@/utils/appError";
import * as reviewRepository from "@/modules/review/review.repository";
import { IReview } from "@/modules/review/review.model";

export const postReview = async (userId: string, body: Partial<IReview>) => {
  const review = await reviewRepository.create({ ...body, user: userId });

  return review;
};

export const getReviewByProduct = async (
  productId: string,
  limit: number,
  page: number,
) => {
  const skip = (page - 1) * limit;

  const [review, total] = await Promise.all([
    reviewRepository.findByProduct(productId, skip, limit),
    reviewRepository.countByProduct(productId),
  ]);

  return {
    items: review,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const updateReview = async (
  id: string,
  userId: string,
  body: Partial<IReview>,
) => {
  const review = await reviewRepository.findByIdAndUpdate(id, userId, body);

  if (!review) throw new AppError("Review not found", 404);

  return review;
};

export const deleteReview = async (id: string, userId: string) => {
  const review = await reviewRepository.findByIdAndDelete(id, userId);

  if (!review) throw new AppError("Review not found", 404);

  return review;
};
