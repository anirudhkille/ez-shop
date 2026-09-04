import * as reviewRepository from "@/modules/review/review.repository";

export const postReview = async (body: any) => {
  const review = await reviewRepository.create(body);

  return {
    status: 201,
    data: {
      success: true,
      message: "Review created successfully",
      data: review,
    },
  };
};

export const getReviewByProduct = async (productId: string, limit: number, page: number) => {
  const skip = (page - 1) * limit;

  const [review, total] = await Promise.all([
    reviewRepository.findByProduct(productId, skip, limit),
    reviewRepository.countByProduct(productId),
  ]);

  return {
    data: {
      success: true,
      message: "Review fetched successfully",
      data: review,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    },
  };
};

export const getReviewById = async (productId: string) => {
  const review = await reviewRepository.findByProduct(productId, 0, 0);

  return {
    data: {
      success: true,
      message: "Review fetched successfully",
      data: review,
    },
  };
};

export const updateReview = async (id: string, userId: string, body: any) => {
  const review = await reviewRepository.findByIdAndUpdate(id, userId, body);

  if (!review)
    return { status: 404, data: { success: false, message: "Review not found" } };

  return {
    data: {
      success: true,
      message: "Review updated successfully",
      data: review,
    },
  };
};

export const deleteReview = async (id: string, userId: string) => {
  const review = await reviewRepository.findByIdAndDelete(id, userId);

  if (!review)
    return { status: 404, data: { success: false, message: "Review not found" } };

  return {
    data: {
      success: true,
      message: "Review deleted successfully",
      data: review,
    },
  };
};
