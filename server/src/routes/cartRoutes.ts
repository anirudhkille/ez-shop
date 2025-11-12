import express from "express";
import { protect } from "../middlewares/authMiddleware";
import {
  addToCart,
  decrementCart,
  getCartByUser,
  incrementCart,
  removeFromCart,
} from "../controllers/cartController";

const router = express.Router();

router.get("/", protect, getCartByUser);
router.post("/", protect, addToCart);
router.patch("/increment", protect, incrementCart);
router.patch("/deccrement", protect, decrementCart);
router.delete("/:productId", protect, removeFromCart);

export default router;
