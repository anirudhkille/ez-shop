import express from "express";
import { protect } from "../middlewares/authMiddleware";
import {
  getCategory,
  postCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/categoryController";

const router = express.Router();

router.get("/", protect, getCategory);
router.post("/", protect, postCategory);
router.patch("/:id", protect, updateCategory);
router.delete("/:id", protect, deleteCategory);

export default router;
