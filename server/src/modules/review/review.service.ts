import { AppError } from "@/utils/appError";
import * as orderRepository from "@/modules/order/order.repository";
import * as productRepository from "@/modules/product/product.repository";
import * as reviewRepository from "@/modules/review/review.repository";
import { IReview, ReviewWithAuthor } from "@/modules/review/review.model";

export interface PublicReview {
  id: string;
  rating: number;
  comment?: string;
  createdAt: string;
  firstName: string;
  lastInitial?: string;
}

const initialOf = (name: string): string | undefined => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const last = parts[1];

  return last ? `${last.charAt(0).toUpperCase()}.` : undefined;
};

export const toPublicReview = (review: ReviewWithAuthor): PublicReview => {
  const parts = (review.user?.name ?? "").trim().split(/\s+/).filter(Boolean);

  return {
    id: String(review._id),
    rating: review.rating,
    comment: review.comment,
    createdAt: review.createdAt.toISOString(),
    firstName: parts[0] ?? "Anonymous",
    lastInitial: initialOf(review.user?.name ?? ""),
  };
};

const syncProductRating = async (productId: string) => {
  const summary = await reviewRepository.summaryFor(productId);

  await productRepository.findByIdAndUpdate(productId, {
    rating: summary.rating,
    reviewsCount: summary.reviewsCount,
  });
};

export const postReview = async (
  userId: string,
  body: Pick<IReview, "product" | "rating" | "comment"> & { productId: string },
) => {
  const productId = String(body.productId);

  const purchased = await orderRepository.hasPurchased(userId, productId);

  if (!purchased) {
    throw new AppError("You can only review a product you have purchased", 403);
  }

  const review = await reviewRepository.upsertForUser(userId, {
    product: productId,
    rating: body.rating,
    comment: body.comment,
  });

  await syncProductRating(productId);

  return toPublicReview(review as ReviewWithAuthor);
};

export const getReviewByProduct = async (
  productId: string,
  limit: number,
  page: number,
) => {
  const skip = (page - 1) * limit;

  const [reviews, total] = await Promise.all([
    reviewRepository.findByProduct(productId, skip, limit),
    reviewRepository.countByProduct(productId),
  ]);

  return {
    items: (reviews as ReviewWithAuthor[]).map(toPublicReview),
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getMyReview = async (productId: string, userId: string) => {
  const review = await reviewRepository.findOwnedByProductAndUser(
    productId,
    userId,
  );

  return review ? toPublicReview(review) : null;
};

export const updateReview = async (
  id: string,
  userId: string,
  body: Pick<IReview, "rating" | "comment">,
) => {
  const review = await reviewRepository.findByIdAndUpdate(id, userId, body);

  if (!review) throw new AppError("Review not found", 404);

  await syncProductRating(String(review.product));

  return toPublicReview(review as ReviewWithAuthor);
};

export const deleteReview = async (id: string, userId: string) => {
  const review = await reviewRepository.findByIdAndDelete(id, userId);

  if (!review) throw new AppError("Review not found", 404);

  await syncProductRating(String(review.product));

  return { deleted: true };
};
