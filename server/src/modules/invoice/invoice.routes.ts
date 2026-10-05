import express from "express";

import { protect } from "@/middlewares/auth.middleware";
import { validate } from "@/middlewares/validate.middleware";
import { orderIdParamSchema } from "@/validation/common.schema";
import {
  downloadInvoice,
  getInvoice,
} from "@/modules/invoice/invoice.controller";

const router = express.Router();

router.get(
  "/:orderId",
  protect,
  validate(orderIdParamSchema, "params"),
  getInvoice,
);
router.get(
  "/:orderId/download",
  protect,
  validate(orderIdParamSchema, "params"),
  downloadInvoice,
);

export default router;
