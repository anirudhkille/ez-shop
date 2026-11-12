import express from "express";

import { protect } from "@/middlewares/auth.middleware";
import { authorize } from "@/middlewares/authorize.middleware";
import { upload } from "@/middlewares/upload.middleware";
import { postUpload } from "@/modules/upload/upload.controller";

const router = express.Router();

router.post(
  "/",
  protect,
  authorize(["Admin"]),
  upload.single("file"),
  postUpload,
);

export default router;
