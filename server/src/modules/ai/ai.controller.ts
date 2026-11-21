import { Request, Response } from "express";

import { generateProductStudio } from "@/modules/ai/product-studio.service";
import { asyncHandler } from "@/utils/async-handler";
import { sendResponse } from "@/utils/response";

export const postProductStudio = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await generateProductStudio(req.body);

    return sendResponse(
      res,
      200,
      "AI product content generated successfully",
      result,
    );
  },
);
