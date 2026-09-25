import express from "express";
import { protect } from "@/middlewares/authMiddleware";
import { validate } from "@/middlewares/validate";
import {
  newsletterPaginationQuerySchema,
  newsletterSchema,
} from "@/modules/newsletter/newsletter.schema";
import {
  getNewsletterSubscribers,
  subscribeNewsletter,
} from "@/modules/newsletter/newsletter.controller";
import { authorize } from "@/middlewares/authorize";

const router = express.Router();

router.get(
  "/",
  protect,
  authorize(["Admin"]),
  validate(newsletterPaginationQuerySchema, "query"),
  getNewsletterSubscribers,
);
router.post("/", validate(newsletterSchema), subscribeNewsletter);

export default router;
