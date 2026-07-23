import express from "express";
import { protect } from "@/middlewares/authMiddleware";
import {
  getSearchProduct,
  postProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getFilteredProducts,
  getFeaturedProducts,
  getBestSellers,
  getSimilarProducts,
} from "@/modules/product/product.controller";
import { authorize } from "@/middlewares/authorize";
import { upload } from "@/middlewares/upload";

const router = express.Router();

router.get("/similar/:id", getSimilarProducts);
router.get("/featured", getFeaturedProducts);
router.get("/best-sellers", getBestSellers);
router.get("/filter", getFilteredProducts);
router.get("/search", getSearchProduct);
router.get("/:slug/:id", getProductById);
router.get("/", getProducts);
router.post(
  "/",
  protect,
  authorize(["Admin"]),
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "variantImages", maxCount: 50 },
  ]),
  postProduct,
);
router.patch("/:id", protect, updateProduct);
router.delete("/:id", protect, deleteProduct);

export default router;
