import express from "express";
import { protect } from "@/middlewares/authMiddleware";
import { validate } from "@/middlewares/validate";
import {
  addressCreateSchema,
  addressIdParamSchema,
  addressUpdateSchema,
} from "@/modules/address/address.schema";
import {
  getAddressByUser,
  postAddress,
  updateAddress,
  deleteAddress,
} from "@/modules/address/address.controller";

const router = express.Router();

router.get("/", protect, getAddressByUser);
router.post("/", protect, validate(addressCreateSchema), postAddress);
router.patch(
  "/:id",
  protect,
  validate(addressIdParamSchema, "params"),
  validate(addressUpdateSchema),
  updateAddress,
);
router.delete(
  "/:id",
  protect,
  validate(addressIdParamSchema, "params"),
  deleteAddress,
);

export default router;
