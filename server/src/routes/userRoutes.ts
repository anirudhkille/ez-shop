import express from "express";
import {
  forgotPassword,
  getProfile,
  login,
  logout,
  refreshToken,
  resetPassword,
  signUp,
  updateProfile,
} from "../controllers/userController";
import { protect } from "../middlewares/authMiddleware";

const router = express.Router();
router.get("/refresh", refreshToken);
router.get("/profile", protect, getProfile);
router.post("/signup", signUp);
router.post("/login", login);
router.post("/logout", logout);

router.post("/forgot-password", forgotPassword);
router.put("/reset-password/:token", resetPassword);
router.patch("/", updateProfile);

export default router;
