import express from "express";
import { protect } from "@/middlewares/authMiddleware";
import {
  addToWishlist,
  getWishlistByUser,
  removeFromWishlist,
} from "@/controllers/wishlistController";

const router = express.Router();

router.get("/", protect, getWishlistByUser);
router.post("/", protect, addToWishlist);
router.delete("/:productId", protect, removeFromWishlist);

export default router;
