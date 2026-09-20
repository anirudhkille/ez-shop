import cloudinary from "@/config/cloudinary";
import { uploadToCloudinary } from "@/utils/uploadToCloudinary";
import * as categoryRepository from "@/modules/category/category.repository";

const extractCloudinaryPublicId = (imageUrl: string) => {
  return imageUrl.split("/").pop()?.split(".")[0];
};

const deleteCategoryImage = async (imageUrl: string) => {
  const publicId = extractCloudinaryPublicId(imageUrl);
  if (publicId) {
    await cloudinary.uploader.destroy(`ez-shop/categories/${publicId}`);
  }
};

export const createCategory = async (
  name: string,
  slug: string,
  file?: Express.Multer.File,
  imageUrl?: string,
) => {
  let finalImageUrl = imageUrl || "";

  if (file) {
    const result = (await uploadToCloudinary("categories", file.buffer)) as {
      secure_url: string;
    };
    finalImageUrl = result.secure_url;
  }

  const category = await categoryRepository.create({
    name,
    slug,
    image: finalImageUrl,
  });

  return {
    success: true,
    message: "Category created successfully",
    data: category,
  };
};

export const getAllCategories = async (page = 1, limit = 10) => {
  const skip = (page - 1) * limit;

  const [categories, total] = await Promise.all([
    categoryRepository.findAll(skip, limit),
    categoryRepository.countDocuments(),
  ]);

  return {
    success: true,
    message: "Categories fetched successfully",
    data: categories,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const updateCategory = async (
  id: string,
  body: { name?: string; slug?: string; image?: string },
  file?: Express.Multer.File,
) => {
  const category = await categoryRepository.findById(id);

  if (!category) {
    return { success: false, status: 404, message: "Category not found" };
  }

  let imageUrl = body.image ?? category.image;

  if (file) {
    if (category.image) {
      await deleteCategoryImage(category.image);
    }

    const result = (await uploadToCloudinary("categories", file.buffer)) as {
      secure_url: string;
    };
    imageUrl = result.secure_url;
  }

  const updated = await categoryRepository.updateById(id, {
    name: body.name,
    slug: body.slug,
    image: imageUrl,
  });

  return {
    success: true,
    message: "Category updated successfully",
    data: updated,
  };
};

export const deleteCategory = async (id: string) => {
  const category = await categoryRepository.deleteById(id);

  if (!category) {
    return { success: false, status: 404, message: "Category not found" };
  }

  if (category.image) {
    await deleteCategoryImage(category.image);
  }

  return {
    success: true,
    message: "Category deleted successfully",
  };
};
