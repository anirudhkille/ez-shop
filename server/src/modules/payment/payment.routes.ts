import express from "express";
import {
  abandonPaymentIntent,
  createCheckoutSession,
  createGuestCheckoutSession,
  createPaymentIntent,
} from "@/modules/payment/payment.controller";
import {
  abandonPaymentSchema,
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
  "/create-payment-intent",
  protect,
  validate(addressDeliverySchema),
  createPaymentIntent,
);
router.post(
  "/create-guest-session",
  validate(guestCheckoutSchema),
  createGuestCheckoutSession,
);
router.post(
  "/abandon",
  protect,
  validate(abandonPaymentSchema),
  abandonPaymentIntent,
);

export default router;
