import express from "express";
import {
  deleteUserById,
  forgotPassword,
  getAllUsers,
  getProfile,
  getUserAdminDetail,
  getUserById,
  login,
  logout,
  refreshToken,
  resetPassword,
  signUp,
  updatePassword,
  updateProfile,
  googleAuth,
  googleCallback,
  verifySignupOTP,
} from "@/modules/user/user.controller";
import {
  forgotPasswordSchema,
  loginSchema,
  passwordUpdateSchema,
  profileUpdateSchema,
  resetPasswordSchema,
  signupSchema,
  userIdParamSchema,
  userPaginationQuerySchema,
  verifySignupOTPSchema,
} from "@/modules/user/user.schema";
import { authLimiter } from "@/config/limiter";
import { protect } from "@/middlewares/auth.middleware";
import { authorize } from "@/middlewares/authorize.middleware";
import { validate } from "@/middlewares/validate.middleware";

const router = express.Router();

router.get("/profile", protect, getProfile);
router.get("/refresh", refreshToken);

router.get("/google", googleAuth);
router.get("/google/callback", googleCallback);

router.post("/signup", authLimiter, validate(signupSchema), signUp);
router.post(
  "/verify-signup-otp",
  authLimiter,
  validate(verifySignupOTPSchema),
  verifySignupOTP,
);
router.post("/login", authLimiter, validate(loginSchema), login);
router.post("/logout", logout);
router.post(
  "/forgot-password",
  authLimiter,
  validate(forgotPasswordSchema),
  forgotPassword,
);
router.put(
  "/reset-password",
  authLimiter,
  validate(resetPasswordSchema),
  resetPassword,
);

router.patch("/", protect, validate(profileUpdateSchema), updateProfile);
router.put(
  "/password",
  protect,
  validate(passwordUpdateSchema),
  updatePassword,
);

router.get(
  "/",
  protect,
  authorize(["Admin"]),
  validate(userPaginationQuerySchema, "query"),
  getAllUsers,
);

router.get(
  "/:id/dashboard",
  protect,
  authorize(["Admin"]),
  validate(userIdParamSchema, "params"),
  getUserAdminDetail,
);
router.get(
  "/:id",
  protect,
  authorize(["Admin"]),
  validate(userIdParamSchema, "params"),
  getUserById,
);
router.delete(
  "/:id",
  protect,
  authorize(["Admin"]),
  validate(userIdParamSchema, "params"),
  deleteUserById,
);

export default router;
