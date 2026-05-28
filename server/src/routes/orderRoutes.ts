import {
  getMyOrder,
  placeCODOrder,
  placeGuestCODOrder,
  getOrders,
  getOrderBySessionId,
  getOrderById,
} from "@/controllers/orderController";
import express from "express";
import { protect } from "@/middlewares/authMiddleware";

const router = express.Router();

router.post("/cod", protect, placeCODOrder);
router.post("/guest", placeGuestCODOrder);
router.get("/", protect, getOrders);
router.get("/session-id/:sessionId", getOrderBySessionId);
router.get("/order-id/:id", getOrderById);
router.get("/my-orders", protect, getMyOrder);
router.get("/:id", protect, getOrderById);

export default router;
