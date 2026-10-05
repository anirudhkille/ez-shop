import express from "express";
import { protect } from "@/middlewares/auth.middleware";
import { validate } from "@/middlewares/validate.middleware";
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
  getMyReview,
} from "@/modules/review/review.controller";

const router = express.Router();

router.get(
  "/mine/:productId",
  protect,
  validate(reviewProductParamSchema, "params"),
  getMyReview,
);
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
