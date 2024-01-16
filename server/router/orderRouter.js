import { order } from "../controllers/orderController.js";
import express from "express";

const router = express.Router();

router.post("/order", order);

export default router;
