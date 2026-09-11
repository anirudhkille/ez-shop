import { asyncHandler } from "@/utils/asyncHandler";
import { Request, Response } from "express";
import { sendSuccess } from "@/utils/response";
import { objectIdParamSchema } from "@/modules/product/product.schema";
import * as categoryService from "@/modules/category/category.service";

const formatZodError = (error: any) =>
  error.errors.map((e: any) => e.message).join(", ");

export const postCategory = asyncHandler(
  async (req: Request, res: Response) => {
    const { name, slug } = req.body;
    const result = await categoryService.createCategory(
      name,
      slug,
      req.file,
    );
    return res.status(201).json(result);
  },
);

export const getCategory = asyncHandler(async (req: Request, res: Response) => {
  const result = await categoryService.getAllCategories();
  sendSuccess(res, result.data, result.message);
});

export const updateCategory = asyncHandler(
  async (req: Request, res: Response) => {
    const paramsParsed = objectIdParamSchema.safeParse(req.params);
    if (!paramsParsed.success) {
      return res
        .status(400)
        .json({ success: false, message: formatZodError(paramsParsed.error) });
    }

    const result = await categoryService.updateCategory(
      paramsParsed.data.id,
      req.body,
      req.file,
    );

    if (!result.success) {
      return res.status(result.status || 400).json(result);
    }

    return res.status(200).json(result);
  },
);

export const deleteCategory = asyncHandler(
  async (req: Request, res: Response) => {
    const paramsParsed = objectIdParamSchema.safeParse(req.params);
    if (!paramsParsed.success) {
      return res
        .status(400)
        .json({ success: false, message: formatZodError(paramsParsed.error) });
    }

    const result = await categoryService.deleteCategory(paramsParsed.data.id);

    if (!result.success) {
      return res.status(result.status || 400).json(result);
    }

    return res.status(200).json(result);
  },
);
