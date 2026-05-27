import express from "express";
import { protect } from "@/middlewares/authMiddleware";
import {
  toggleWishlist,
  getWishlistByUser,
  getWishlistDetails,
} from "@/controllers/wishlistController";

const router = express.Router();

router.get("/", protect, getWishlistByUser);
router.get("/details", protect, getWishlistDetails);
router.post("/toggle", protect, toggleWishlist);

export default router;
