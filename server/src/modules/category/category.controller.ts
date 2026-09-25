import { asyncHandler } from "@/utils/asyncHandler";
import { Request, Response } from "express";
import * as categoryService from "@/modules/category/category.service";

export const postCategory = asyncHandler(
  async (req: Request, res: Response) => {
    const { name, slug, image } = req.body;
    const result = await categoryService.createCategory(
      name,
      slug,
      req.file,
      image,
    );
    return res.status(201).json(result);
  },
);

export const getCategory = asyncHandler(async (req: Request, res: Response) => {
  const { page = 1, limit = 10 } = req.query as {
    page?: number;
    limit?: number;
  };
  const result = await categoryService.getAllCategories(page, limit);
  return res.status(200).json(result);
});

export const updateCategory = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await categoryService.updateCategory(
      req.params.id,
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
    const result = await categoryService.deleteCategory(req.params.id);

    if (!result.success) {
      return res.status(result.status || 400).json(result);
    }

    return res.status(200).json(result);
  },
);
