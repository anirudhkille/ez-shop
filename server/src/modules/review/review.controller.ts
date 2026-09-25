import { asyncHandler } from "@/utils/asyncHandler";
import { sendResponse } from "@/utils/response";
import { Request, Response } from "express";
import * as reviewService from "@/modules/review/review.service";

export const postReview = asyncHandler(async (req: Request, res: Response) => {
  const review = await reviewService.postReview(req.user!._id, req.body);

  return sendResponse(res, 201, "Review created successfully", review);
});

export const getReviewByProduct = asyncHandler(
  async (req: Request, res: Response) => {
    const limit = Number(req.query.limit) || 10;
    const page = Number(req.query.page) || 1;

    const result = await reviewService.getReviewByProduct(
      req.params.productId,
      limit,
      page,
    );

    return sendResponse(
      res,
      200,
      "Reviews fetched successfully",
      result.items,
      result.pagination,
    );
  },
);

export const updateReview = asyncHandler(
  async (req: Request, res: Response) => {
    const review = await reviewService.updateReview(
      req.params.id,
      req.user!._id,
      req.body,
    );

    return sendResponse(res, 200, "Review updated successfully", review);
  },
);

export const deleteReview = asyncHandler(
  async (req: Request, res: Response) => {
    const review = await reviewService.deleteReview(
      req.params.id,
      req.user!._id,
    );

    return sendResponse(res, 200, "Review deleted successfully", review);
  },
);
