import { asyncHandler } from "@/utils/asyncHandler";
import { Request, Response } from "express";
import * as reviewService from "@/modules/review/review.service";

export const postReview = asyncHandler(async (req: Request, res: Response) => {
  const result = await reviewService.postReview(req.body);
  return res.status(result.status || 200).json(result.data);
});

export const getReviewByProduct = asyncHandler(
  async (req: Request, res: Response) => {
    const limit = Number(req.query.limit) || 10;
    const page = Number(req.query.page) || 1;

    const result = await reviewService.getReviewByProduct(req.params.productId, limit, page);
    return res.status(200).json(result.data);
  },
);

export const getReviewById = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await reviewService.getReviewById(req.params.productId);
    return res.status(200).json(result.data);
  },
);

export const updateReview = asyncHandler(
  async (req: any, res: Response) => {
    const result = await reviewService.updateReview(
      req.params.id,
      req.user._id,
      req.body,
    );

    if (result.status === 404)
      return res.status(404).json(result.data);

    return res.status(200).json(result.data);
  },
);

export const deleteReview = asyncHandler(
  async (req: any, res: Response) => {
    const result = await reviewService.deleteReview(
      req.params.id,
      req.user._id,
    );

    if (result.status === 404)
      return res.status(404).json(result.data);

    return res.status(200).json(result.data);
  },
);
