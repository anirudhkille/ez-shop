import express from "express";
import {
  createCheckoutSession,
  createGuestCheckoutSession,
} from "@/controllers/paymentController";
import { protect } from "@/middlewares/authMiddleware";

const router = express.Router();

router.post("/create-checkout-session", protect, createCheckoutSession);
router.post("/create-guest-session", createGuestCheckoutSession);

export default router;
