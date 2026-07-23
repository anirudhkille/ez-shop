import express from "express";
import { protect } from "@/middlewares/authMiddleware";
import {
  postReview,
  updateReview,
  deleteReview,
  getReviewByProduct,
} from "@/modules/review/review.controller";

const router = express.Router();

router.get("/:productId", protect, getReviewByProduct);
router.post("/", protect, postReview);
router.patch("/:id", protect, updateReview);
router.delete("/:id", protect, deleteReview);

export default router;
