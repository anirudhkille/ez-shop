import express from "express";
import {
  forgotPassword,
  getProfile,
  googleLogin,
  login,
  resetPassword,
} from "../controllers/adminController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();
// router.post("/signup", signUp);
router.post("/google-login", googleLogin);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.put("/reset-password", resetPassword);

router.get("/profile", protect, getProfile);

export default router;
