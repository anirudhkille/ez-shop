import express from "express";
import { protect } from "@/middlewares/auth.middleware";
import { validate } from "@/middlewares/validate.middleware";
import {
  newsletterPaginationQuerySchema,
  newsletterSchema,
} from "@/modules/newsletter/newsletter.schema";
import {
  getNewsletterSubscribers,
  subscribeNewsletter,
} from "@/modules/newsletter/newsletter.controller";
import { authorize } from "@/middlewares/authorize.middleware";

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
