import { asyncHandler } from "@/utils/asyncHandler";
import { sendResponse } from "@/utils/response";
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

    return sendResponse(res, 201, "Category created successfully", result);
  },
);

export const getCategory = asyncHandler(async (req: Request, res: Response) => {
  const { page = 1, limit = 10 } = req.query as {
    page?: number;
    limit?: number;
  };
  const result = await categoryService.getAllCategories(page, limit);

  return sendResponse(
    res,
    200,
    "Categories fetched successfully",
    result.items,
    result.pagination,
  );
});

export const updateCategory = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await categoryService.updateCategory(
      req.params.id,
      req.body,
      req.file,
    );

    return sendResponse(res, 200, "Category updated successfully", result);
  },
);

export const deleteCategory = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await categoryService.deleteCategory(req.params.id);

    return sendResponse(res, 200, "Category deleted successfully", result);
  },
);
