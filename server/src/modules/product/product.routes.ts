import express from "express";
import { protect } from "@/middlewares/authMiddleware";
import {
  filteredProductQuerySchema,
  productCreateSchema,
  productIdParamSchema,
  productParamsSchema,
  productQuerySchema,
  productUpdateSchema,
  searchQuerySchema,
  similarProductParamsSchema,
} from "@/modules/product/product.schema";
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
import { validate } from "@/middlewares/validate";
import { upload } from "@/middlewares/upload";

const router = express.Router();

router.get(
  "/similar/:id",
  validate(similarProductParamsSchema, "params"),
  getSimilarProducts,
);
router.get("/featured", getFeaturedProducts);
router.get("/best-sellers", getBestSellers);
router.get(
  "/filter",
  validate(filteredProductQuerySchema, "query"),
  getFilteredProducts,
);
router.get("/search", validate(searchQuerySchema, "query"), getSearchProduct);
router.get(
  "/:slug/:id",
  validate(productParamsSchema, "params"),
  getProductById,
);
router.get("/", validate(productQuerySchema, "query"), getProducts);
router.post(
  "/",
  protect,
  authorize(["Admin"]),
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "variantImages", maxCount: 50 },
  ]),
  validate(productCreateSchema),
  postProduct,
);
router.patch(
  "/:id",
  protect,
  authorize(["Admin"]),
  validate(productIdParamSchema, "params"),
  validate(productUpdateSchema),
  updateProduct,
);
router.delete(
  "/:id",
  protect,
  authorize(["Admin"]),
  validate(productIdParamSchema, "params"),
  deleteProduct,
);

export default router;
