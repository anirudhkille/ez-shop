import express from "express";
import { protect } from "@/middlewares/authMiddleware";
import {
  getCategory,
  postCategory,
  updateCategory,
  deleteCategory,
} from "@/modules/category/category.controller";
import { categorySchema } from "@/modules/product/product.schema";
import { authorize } from "@/middlewares/authorize";
import { upload } from "@/middlewares/upload";
import { validate } from "@/middlewares/validate";

const router = express.Router();

router.get("/", getCategory);
router.post(
  "/",
  protect,
  authorize(["Admin"]),
  upload.single("image"),
  validate(categorySchema),
  postCategory,
);

router.patch(
  "/:id",
  protect,
  authorize(["Admin"]),
  upload.single("image"),
  validate(categorySchema),
  updateCategory,
);

router.delete("/:id", protect, authorize(["Admin"]), deleteCategory);

export default router;
