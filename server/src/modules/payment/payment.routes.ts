import express from "express";
import {
  createCheckoutSession,
  createGuestCheckoutSession,
} from "@/modules/payment/payment.controller";
import {
  addressDeliverySchema,
  guestCheckoutSchema,
} from "@/modules/order/order.schema";
import { protect } from "@/middlewares/auth.middleware";
import { validate } from "@/middlewares/validate.middleware";

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
