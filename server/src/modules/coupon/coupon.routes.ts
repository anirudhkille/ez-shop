import express from "express";

import { optionalAuth, protect } from "@/middlewares/authMiddleware";
import { authorize } from "@/middlewares/authorize";
import { validate } from "@/middlewares/validate";
import {
  couponCreateSchema,
  couponIdParamSchema,
  couponPaginationQuerySchema,
  couponUpdateSchema,
  couponValidateSchema,
} from "@/modules/coupon/coupon.schema";
import {
  applyCoupon,
  deleteCoupon,
  getCouponById,
  getCoupons,
  postCoupon,
  updateCoupon,
} from "@/modules/coupon/coupon.controller";

const router = express.Router();

// Public quote endpoint so guests can preview a discount too. optionalAuth
// still lets a signed-in customer have their per-user limit checked.
router.post(
  "/apply",
  optionalAuth,
  validate(couponValidateSchema),
  applyCoupon,
);

// Coupon management is admin-only: the customer never reads coupons directly,
// they just submit a code at checkout.
router.get(
  "/",
  protect,
  authorize(["Admin"]),
  validate(couponPaginationQuerySchema, "query"),
  getCoupons,
);

router.get(
  "/:id",
  protect,
  authorize(["Admin"]),
  validate(couponIdParamSchema, "params"),
  getCouponById,
);

router.post(
  "/",
  protect,
  authorize(["Admin"]),
  validate(couponCreateSchema),
  postCoupon,
);

router.patch(
  "/:id",
  protect,
  authorize(["Admin"]),
  validate(couponIdParamSchema, "params"),
  validate(couponUpdateSchema),
  updateCoupon,
);

router.delete(
  "/:id",
  protect,
  authorize(["Admin"]),
  validate(couponIdParamSchema, "params"),
  deleteCoupon,
);

export default router;
