import express from "express";
import { createCheckoutSession } from "../controllers/stripeController";
import { protect } from "../middlewares/authMiddleware";

const router = express.Router();

router.post("/create-checkout-session", protect, createCheckoutSession);

export default router;
