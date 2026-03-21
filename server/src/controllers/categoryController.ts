import { asyncHandler } from '@/middlewares/asyncHandler';
import Category from '@/models/Category';
import { Request, Response } from 'express';
import { uploadToCloudinary } from '@/utils/uploadToCloudinary';
import cloudinary from '@/config/cloudinary';

export const postCategory = asyncHandler(
  async (req: Request, res: Response) => {
    let imageUrl = '';
    const { name, slug } = req.body;

    if (req.file) {
      const result: any = await uploadToCloudinary(req.file.buffer);
      imageUrl = result.secure_url;
    }

    const category = await Category.create({
      name,
      slug,
      image: imageUrl,
    });

    return res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: category,
    });
  },
);

export const getCategory = asyncHandler(async (req: Request, res: Response) => {
  const category = await Category.find().lean();

  return res.status(200).json({
    success: true,
    message: 'Category fetched successfully',
    data: category,
  });
});

export const updateCategory = asyncHandler(
  async (req: Request, res: Response) => {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }

    let imageUrl = category.image;

    if (req.file) {
      // delete old image
      if (category.image) {
        const publicId = category.image.split('/').pop()?.split('.')[0];
        if (publicId) {
          await cloudinary.uploader.destroy(`ez-shop/categories/${publicId}`);
        }
      }

      // upload new image
      const result: any = await uploadToCloudinary(req.file.buffer);
      imageUrl = result.secure_url;
    }

    const updated = await Category.findByIdAndUpdate(
      req.params.id,
      { ...req.body, image: imageUrl },
      { new: true },
    );

    return res.status(200).json({
      success: true,
      message: 'Category updated successfully',
      data: updated,
    });
  },
);

export const deleteCategory = asyncHandler(
  async (req: Request, res: Response) => {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }

    // delete image from cloudinary
    if (category.image) {
      const publicId = category.image.split('/').pop()?.split('.')[0];
      if (publicId) {
        await cloudinary.uploader.destroy(`ez-shop/categories/${publicId}`);
      }
    }

    await category.deleteOne();

    return res.status(200).json({
      success: true,
      message: 'Category deleted successfully',
    });
  },
);
