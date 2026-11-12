import { Request, Response } from "express";

import { asyncHandler } from "@/utils/async-handler";
import { sendResponse } from "@/utils/response";
import * as uploadService from "@/modules/upload/upload.service";

export const postUpload = asyncHandler(async (req: Request, res: Response) => {
  const result = await uploadService.uploadImage(req.file, req.body.folder);

  return sendResponse(res, 201, "Image uploaded successfully", result);
});
