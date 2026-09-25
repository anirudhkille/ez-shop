import {
  deleteOrder,
  getMyOrder,
  getOrderById,
  getOrderBySessionId,
  getOrders,
  placeCODOrder,
  placeGuestCODOrder,
  updateOrder,
} from "@/modules/order/order.controller";
import {
  addressDeliverySchema,
  guestCheckoutSchema,
  orderIdParamSchema,
  orderPaginationQuerySchema,
  orderStatusUpdateSchema,
  sessionIdParamSchema,
} from "@/modules/order/order.schema";
import express from "express";
import { optionalAuth, protect } from "@/middlewares/authMiddleware";
import { authorize } from "@/middlewares/authorize";
import { validate } from "@/middlewares/validate";

const router = express.Router();

router.post("/cod", protect, validate(addressDeliverySchema), placeCODOrder);
router.post("/guest", validate(guestCheckoutSchema), placeGuestCODOrder);
router.get(
  "/",
  protect,
  authorize(["Admin"]),
  validate(orderPaginationQuerySchema, "query"),
  getOrders,
);
router.get(
  "/session-id/:sessionId",
  optionalAuth,
  validate(sessionIdParamSchema, "params"),
  getOrderBySessionId,
);
router.get(
  "/order-id/:id",
  optionalAuth,
  validate(orderIdParamSchema, "params"),
  getOrderById,
);
router.get(
  "/my-orders",
  protect,
  validate(orderPaginationQuerySchema, "query"),
  getMyOrder,
);
router.get(
  "/:id",
  protect,
  validate(orderIdParamSchema, "params"),
  getOrderById,
);
router.patch(
  "/:id",
  protect,
  authorize(["Admin"]),
  validate(orderIdParamSchema, "params"),
  validate(orderStatusUpdateSchema),
  updateOrder,
);
router.delete(
  "/:id",
  protect,
  authorize(["Admin"]),
  validate(orderIdParamSchema, "params"),
  deleteOrder,
);

export default router;
