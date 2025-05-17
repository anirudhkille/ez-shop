import express from "express";
import {
  forgotPassword,
  getProfile,
  login,
  resetPassword,
  signUp,updateProfile
} from "../controllers/userController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();
router.get("/profile", protect, getProfile);
router.post("/signup", signUp);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.put("/reset-password/:token", resetPassword);
router.patch("/", updateProfile);

export default router;
