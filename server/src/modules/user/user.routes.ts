import express from "express";
import {
  forgotPassword,
  getProfile,
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
import { authLimiter } from "@/config/limiter";
import { protect } from "@/middlewares/authMiddleware";
import passport from "@/config/passport";

const router = express.Router();
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
router.post("/signup", authLimiter, signUp);
router.post("/verify-signup-otp", verifySignupOTP);
router.post("/login", authLimiter, login);
router.post("/logout", protect, logout);
router.post("/forgot-password", authLimiter, forgotPassword);
router.put("/reset-password/:token", resetPassword);
router.patch("/", protect, updateProfile);
router.put("/password", protect, updatePassword);

export default router;
