import { asyncHandler } from "@/middlewares/asyncHandler";
import Review from "@/models/Review";
import { Request, Response } from "express";

export const postReview = asyncHandler(async (req: Request, res: Response) => {
  const review = new Review(req.body);
  review.save();

  return res.status(201).json({
    success: true,
    message: "Review created successfully",
    data: review,
  });
});

export const getReviewByProduct = asyncHandler(
  async (req: Request, res: Response) => {
    const limit = Number(req.query.limit) || 10;
    const page = Number(req.query.page) || 1;

    const skip = (page - 1) * limit;
    const [review, total] = await Promise.all([
      Review.find({ product: req.params.productId }).skip(skip).limit(limit),
      Review.countDocuments({ product: req.params.productId }),
    ]);

    return res.status(200).json({
      success: true,
      message: "Review fetched successfully",
      data: review,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  },
);

export const getReviewById = asyncHandler(
  async (req: Request, res: Response) => {
    const review = await Review.find({ product: req.params.productId });

    return res.status(200).json({
      success: true,
      message: "Review fetched successfully",
      data: review,
    });
  },
);

export const updateReview = asyncHandler(
  async (req: Request, res: Response) => {
    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { new: true },
    );

    if (!review)
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });

    return res.status(200).json({
      success: true,
      message: "Review updated successfully",
      data: review,
    });
  },
);

export const deleteReview = asyncHandler(
  async (req: Request, res: Response) => {
    const review = await Review.findByIdAndDelete(req.params.id);

    if (!review)
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });

    return res.status(200).json({
      success: true,
      message: "Review deleted successfully",
      data: review,
    });
  },
);
