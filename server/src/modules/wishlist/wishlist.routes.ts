import express from "express";
import { protect } from "@/middlewares/authMiddleware";
import { validate } from "@/middlewares/validate";
import { wishlistSchema } from "@/modules/wishlist/wishlist.schema";
import {
  toggleWishlist,
  getWishlistByUser,
  getWishlistDetails,
} from "@/modules/wishlist/wishlist.controller";

const router = express.Router();

router.get("/", protect, getWishlistByUser);
router.get("/details", protect, getWishlistDetails);
router.post("/toggle", protect, validate(wishlistSchema), toggleWishlist);

export default router;
