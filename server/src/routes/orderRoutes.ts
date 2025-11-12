import { getMyOrder, getOrderById } from "../controllers/orderController";
import express from "express";
import { protect } from "../middlewares/authMiddleware";

const router = express.Router();

router.get("/my-orders", protect, getMyOrder);
router.get("/:id", protect, getOrderById);

export default router;
