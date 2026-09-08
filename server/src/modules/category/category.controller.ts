import { asyncHandler } from "@/utils/asyncHandler";
import Category from "@/modules/category/category.model";
import { Request, Response } from "express";
import { uploadToCloudinary } from "@/utils/uploadToCloudinary";
import cloudinary from "@/config/cloudinary";
import { sendSuccess } from "@/utils/response";
import { objectIdParamSchema } from "@/modules/product/product.schema";

const formatZodError = (error: any) =>
  error.errors.map((e: any) => e.message).join(", ");

export const postCategory = asyncHandler(
  async (req: Request, res: Response) => {
    const { name, slug } = req.body;

    let imageUrl = "";

    if (req.file) {
      const result: any = await uploadToCloudinary(
        "categories",
        req.file.buffer,
      );
      imageUrl = result.secure_url;
    }

    const category = await Category.create({
      name,
      slug,
      image: imageUrl,
    });

    return res.status(201).json({
      success: true,
      message: "Category created successfully",
      data: category,
    });
  },
);

export const getCategory = asyncHandler(async (req: Request, res: Response) => {
  const categories = await Category.find().lean();

  sendSuccess(res, categories, "Category fetched successfully");
});

export const updateCategory = asyncHandler(
  async (req: Request, res: Response) => {
    const paramsParsed = objectIdParamSchema.safeParse(req.params);
    if (!paramsParsed.success) {
      return res
        .status(400)
        .json({ success: false, message: formatZodError(paramsParsed.error) });
    }

    const category = await Category.findById(paramsParsed.data.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    let imageUrl = category.image;

    if (req.file) {
      // delete old image
      if (category.image) {
        const publicId = category.image.split("/").pop()?.split(".")[0];
        if (publicId) {
          await cloudinary.uploader.destroy(`ez-shop/categories/${publicId}`);
        }
      }

      // upload new image
      const result: any = await uploadToCloudinary(
        "categories",
        req.file.buffer,
      );
      imageUrl = result.secure_url;
    }

    const updated = await Category.findByIdAndUpdate(
      paramsParsed.data.id,
      { ...req.body, image: imageUrl },
      { new: true },
    );

    return res.status(200).json({
      success: true,
      message: "Category updated successfully",
      data: updated,
    });
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

    const category = await Category.findById(paramsParsed.data.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    // delete image from cloudinary
    if (category.image) {
      const publicId = category.image.split("/").pop()?.split(".")[0];
      if (publicId) {
        await cloudinary.uploader.destroy(`ez-shop/categories/${publicId}`);
      }
    }

    await category.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Category deleted successfully",
    });
  },
);
