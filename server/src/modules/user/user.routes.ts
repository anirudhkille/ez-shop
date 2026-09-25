import express from "express";
import {
  deleteUserById,
  forgotPassword,
  getAllUsers,
  getProfile,
  getUserById,
  login,
  logout,
  refreshToken,
  resetPassword,
  signUp,
  updatePassword,
  updateProfile,
  googleLogin,
  verifySignupOTP,
} from "@/modules/user/user.controller";
import {
  forgotPasswordSchema,
  loginSchema,
  passwordUpdateSchema,
  profileUpdateSchema,
  resetPasswordBodySchema,
  resetPasswordParamsSchema,
  signupSchema,
  userIdParamSchema,
  userPaginationQuerySchema,
  verifySignupOTPSchema,
} from "@/modules/user/user.schema";
import { authLimiter } from "@/config/limiter";
import { protect } from "@/middlewares/authMiddleware";
import { authorize } from "@/middlewares/authorize";
import { validate } from "@/middlewares/validate";
import passport from "@/config/passport";

const router = express.Router();

router.get(
  "/",
  protect,
  authorize(["Admin"]),
  validate(userPaginationQuerySchema, "query"),
  getAllUsers,
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

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] }),
);
router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/auth/login-failed" }),
  googleLogin,
);
router.get("/login-failed", (req, res) => res.send("Google login failed"));
router.get("/refresh", refreshToken);
router.get("/profile", protect, getProfile);
router.post("/signup", authLimiter, validate(signupSchema), signUp);
router.post(
  "/verify-signup-otp",
  validate(verifySignupOTPSchema),
  verifySignupOTP,
);
router.post("/login", authLimiter, validate(loginSchema), login);
router.post("/logout", protect, logout);
router.post(
  "/forgot-password",
  authLimiter,
  validate(forgotPasswordSchema),
  forgotPassword,
);
router.put(
  "/reset-password/:token",
  validate(resetPasswordParamsSchema, "params"),
  validate(resetPasswordBodySchema),
  resetPassword,
);
router.patch("/", protect, validate(profileUpdateSchema), updateProfile);
router.put(
  "/password",
  protect,
  validate(passwordUpdateSchema),
  updatePassword,
);

export default router;
