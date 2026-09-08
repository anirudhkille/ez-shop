import express from "express";
import {
  createCheckoutSession,
  createGuestCheckoutSession,
} from "@/modules/payment/payment.controller";
import {
  addressDeliverySchema,
  guestCheckoutSchema,
} from "@/modules/order/order.schema";
import { protect } from "@/middlewares/authMiddleware";
import { validate } from "@/middlewares/validate";

const router = express.Router();

router.post(
  "/create-checkout-session",
  protect,
  validate(addressDeliverySchema),
  createCheckoutSession,
);
router.post(
  "/create-guest-session",
  validate(guestCheckoutSchema),
  createGuestCheckoutSession,
);

export default router;
