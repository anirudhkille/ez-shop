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
} from "@/modules/order/order.schema";
import express from "express";
import { optionalAuth, protect } from "@/middlewares/authMiddleware";
import { authorize } from "@/middlewares/authorize";
import { validate } from "@/middlewares/validate";

const router = express.Router();

router.post("/cod", protect, validate(addressDeliverySchema), placeCODOrder);
router.post("/guest", validate(guestCheckoutSchema), placeGuestCODOrder);
router.get("/", protect, authorize(["Admin"]), getOrders);
router.get("/session-id/:sessionId", optionalAuth, getOrderBySessionId);
router.get("/order-id/:id", optionalAuth, getOrderById);
router.get("/my-orders", protect, getMyOrder);
router.get("/:id", protect, getOrderById);
router.patch("/:id", protect, authorize(["Admin"]), updateOrder);
router.delete("/:id", protect, authorize(["Admin"]), deleteOrder);

export default router;
