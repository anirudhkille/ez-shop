import express from "express";
import { protect } from "@/middlewares/auth.middleware";
import { validate } from "@/middlewares/validate.middleware";
import {
  categoryCreateSchema,
  categoryIdParamSchema,
  categoryPaginationQuerySchema,
  categoryUpdateSchema,
} from "@/modules/category/category.schema";
import {
  getCategory,
  postCategory,
  updateCategory,
  deleteCategory,
} from "@/modules/category/category.controller";
import { authorize } from "@/middlewares/authorize.middleware";
import { upload } from "@/middlewares/upload.middleware";

const router = express.Router();

router.get("/", validate(categoryPaginationQuerySchema, "query"), getCategory);
router.post(
  "/",
  protect,
  authorize(["Admin"]),
  upload.single("image"),
  validate(categoryCreateSchema),
  postCategory,
);

router.patch(
  "/:id",
  protect,
  authorize(["Admin"]),
  upload.single("image"),
  validate(categoryIdParamSchema, "params"),
  validate(categoryUpdateSchema),
  updateCategory,
);

router.delete(
  "/:id",
  protect,
  authorize(["Admin"]),
  validate(categoryIdParamSchema, "params"),
  deleteCategory,
);

export default router;
