import express from "express";
import { protect } from "@/middlewares/authMiddleware";
import { validate } from "@/middlewares/validate";
import {
  addToCartSchema,
  cartItemIdParamSchema,
  updateCartSchema,
} from "@/modules/cart/cart.schema";
import {
  addToCart,
  updateQuantity,
  getCart,
  clearCart,
  removeFromCart,
  getCartItemCount,
} from "@/modules/cart/cart.controller";

const router = express.Router();

router.get("/", protect, getCart);
router.get("/count", protect, getCartItemCount);
router.post("/", protect, validate(addToCartSchema), addToCart);
router.put("/", protect, validate(updateCartSchema), updateQuantity);
router.delete("/clear", protect, clearCart);
router.delete(
  "/:cartItemId",
  protect,
  validate(cartItemIdParamSchema, "params"),
  removeFromCart,
);

export default router;
