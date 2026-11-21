import express from "express";

import { aiLimiter } from "@/config/limiter";
import { protect } from "@/middlewares/auth.middleware";
import { authorize } from "@/middlewares/authorize.middleware";
import { validate } from "@/middlewares/validate.middleware";
import { postProductStudio } from "@/modules/ai/ai.controller";
import { productStudioInputSchema } from "@/modules/ai/ai.schema";

const router = express.Router();

router.post(
  "/product-studio",
  protect,
  authorize(["Admin"]),
  aiLimiter,
  validate(productStudioInputSchema),
  postProductStudio,
);

export default router;
