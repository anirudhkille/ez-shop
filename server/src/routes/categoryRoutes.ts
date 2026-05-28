import express from "express";
import { protect } from "@/middlewares/authMiddleware";
import {
  getCategory,
  postCategory,
  updateCategory,
  deleteCategory,
} from "@/controllers/categoryController";
import { authorize } from "@/middlewares/authorize";
import { upload } from "@/middlewares/upload";

const router = express.Router();

router.get("/", getCategory);
router.post(
  "/",
  protect,
  authorize(["Admin"]),
  upload.single("image"),
  postCategory,
);

router.patch(
  "/:id",
  protect,
  authorize(["Admin"]),
  upload.single("image"),
  updateCategory,
);

router.delete("/:id", protect, authorize(["Admin"]), deleteCategory);

export default router;
