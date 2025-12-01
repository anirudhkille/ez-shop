import express from "express";
import { protect } from "../middlewares/authMiddleware";
import {
  getSearchProduct,
  postProduct,
  getProducts,
  getProductBySlug,
  updateProduct,
  deleteProduct,
} from "../controllers/productController";

const router = express.Router();

router.get("/search", getSearchProduct);
router.get("/:slug", getProductBySlug);
router.get("/", getProducts);
router.post("/", protect, postProduct);
router.patch("/:id", protect, updateProduct);
router.delete("/:id", protect, deleteProduct);

export default router;
