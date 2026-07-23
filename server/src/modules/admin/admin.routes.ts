import express from "express";
import {
  forgotPassword,
  getProfile,
  login,
  resetPassword,
  editProfile,
} from "@/modules/admin/admin.controller";
import { protect } from "@/middlewares/authMiddleware";

const router = express.Router();

router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.put("/reset-password", resetPassword);
router.patch("/profile", protect, editProfile);
router.get("/profile", protect, getProfile);

export default router;
