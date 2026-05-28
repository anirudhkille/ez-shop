import express from "express";
import { protect } from "@/middlewares/authMiddleware";
import {
  getNewsletterSubscribers,
  subscribeNewsletter,
} from "@/controllers/newsletterController";
import { authorize } from "@/middlewares/authorize";

const router = express.Router();

router.get("/", protect, authorize(["Admin"]), getNewsletterSubscribers);
router.post("/", subscribeNewsletter);

export default router;
