import express from "express";
import { protect } from "@/middlewares/authMiddleware";
import { validate } from "@/middlewares/validate";
import {
  reviewCreateSchema,
  reviewIdParamSchema,
  reviewPaginationQuerySchema,
  reviewProductParamSchema,
  reviewUpdateSchema,
} from "@/modules/review/review.schema";
import {
  postReview,
  updateReview,
  deleteReview,
  getReviewByProduct,
} from "@/modules/review/review.controller";

const router = express.Router();

router.get(
  "/:productId",
  validate(reviewProductParamSchema, "params"),
  validate(reviewPaginationQuerySchema, "query"),
  getReviewByProduct,
);
router.post("/", protect, validate(reviewCreateSchema), postReview);
router.patch(
  "/:id",
  protect,
  validate(reviewIdParamSchema, "params"),
  validate(reviewUpdateSchema),
  updateReview,
);
router.delete(
  "/:id",
  protect,
  validate(reviewIdParamSchema, "params"),
  deleteReview,
);

export default router;
