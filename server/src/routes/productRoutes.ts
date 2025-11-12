import express from "express";
import { protect } from "../middlewares/authMiddleware";
import {
  getSearchProduct,
  postProduct,
  getProduct,
  getProductById,
  updateProduct,
  deleteProduct,
} from "../controllers/productController";

const router = express.Router();

router.get("/search", protect, getSearchProduct);
router.get("/:id", protect, getProductById);
router.get("/", protect, getProduct);
router.post("/", protect, postProduct);
router.patch("/:id", protect, updateProduct);
router.delete("/:id", protect, deleteProduct);

export default router;
