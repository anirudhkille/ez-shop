import { asyncHandler } from "../middlewares/asyncHandler";
import Category from "../models/Category";
import { Request, Response } from "express";

export const postCategory = asyncHandler(
  async (req: Request, res: Response) => {
    const category = new Category(req.body);
    category.save();

    return res.status(201).json({
      success: true,
      message: "Category created successfully",
      data: category,
    });
  }
);

export const getCategory = asyncHandler(async (req: Request, res: Response) => {
  const category = await Category.find();

  return res.status(200).json({
    success: true,
    message: "Category fetched successfully",
    data: category,
  });
});

export const updateCategory = asyncHandler(
  async (req: Request, res: Response) => {
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { new: true }
    );

    if (!category)
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });

    return res.status(200).json({
      success: true,
      message: "Category updated successfully",
      data: category,
    });
  }
);

export const deleteCategory = asyncHandler(
  async (req: Request, res: Response) => {
    const category = await Category.findByIdAndDelete(req.params.id);

    if (!category)
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });

    return res.status(200).json({
      success: true,
      message: "Category deleted successfully",
      data: category,
    });
  }
);
