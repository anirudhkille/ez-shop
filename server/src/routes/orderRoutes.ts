import {
  getMyOrder,
  placeCODOrder,
  getOrders,
  getOrderBySessionId,
  getOrderById,
} from "@/controllers/orderController";
import express from "express";
import { protect } from "@/middlewares/authMiddleware";

const router = express.Router();

router.post("/cod", protect, placeCODOrder);
router.get("/", protect, getOrders);
router.get("/session-id/:sessionId", protect, getOrderBySessionId);
router.get("/order-id/:id", protect, getOrderById);
router.get("/my-orders", protect, getMyOrder);
router.get("/:id", protect, getOrderById);

export default router;
