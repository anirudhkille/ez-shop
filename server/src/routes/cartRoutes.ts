import express from "express";
import { protect } from "@/middlewares/authMiddleware";
import {
  addToCart,
  updateQuantity,
  getCart,
  clearCart,
  removeFromCart,
  getCartItemCount,
} from "@/controllers/cartController";

const router = express.Router();

router.get("/", protect, getCart);
router.get("/count", protect, getCartItemCount);
router.post("/", protect, addToCart);
router.put("/", protect, updateQuantity);
router.delete("/clear", protect, clearCart);
router.delete("/:cartItemId", protect, removeFromCart);

export default router;
