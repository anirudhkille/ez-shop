import express from "express";
import { verifyUser } from "../middleware/verifyUser.js";
import {
  forgotPassword,
  getProfile,
  login,
  resetPassword,
  signUp,
} from "../controllers/UserController.js";

const router = express.Router();
router.post("/signup", signUp);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.put("/reset-password/:token", resetPassword);
router.get("/profile", verifyUser, getProfile);

export default router;
