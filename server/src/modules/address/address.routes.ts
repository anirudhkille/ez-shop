import express from "express";
import { protect } from "@/middlewares/authMiddleware";
import {
  getAddressByUser,
  postAddress,
  updateAddress,
  deleteAddress,
} from "@/modules/address/address.controller";

const router = express.Router();

router.get("/", protect, getAddressByUser);
router.post("/", protect, postAddress);
router.patch("/:id", protect, updateAddress);
router.delete("/:id", protect, deleteAddress);

export default router;
