import express from "express";
import {
  forgotPassword,
  getProfile,
  login,
  resetPassword,
  editProfile,
} from "@/modules/admin/admin.controller";
import {
  adminForgotPasswordSchema,
  adminLoginSchema,
  adminProfileUpdateSchema,
  adminResetPasswordSchema,
} from "@/modules/admin/admin.schema";
import { authLimiter } from "@/config/limiter";
import { protect } from "@/middlewares/authMiddleware";
import { validate } from "@/middlewares/validate";

const router = express.Router();

router.post("/login", authLimiter, validate(adminLoginSchema), login);
router.post(
  "/forgot-password",
  authLimiter,
  validate(adminForgotPasswordSchema),
  forgotPassword,
);
router.put(
  "/reset-password",
  validate(adminResetPasswordSchema),
  resetPassword,
);
router.patch(
  "/profile",
  protect,
  validate(adminProfileUpdateSchema),
  editProfile,
);
router.get("/profile", protect, getProfile);

export default router;
