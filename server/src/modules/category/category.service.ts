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
) => {
  let imageUrl = "";

  if (file) {
    const result: any = await uploadToCloudinary("categories", file.buffer);
    imageUrl = result.secure_url;
  }

  const category = await categoryRepository.create({ name, slug, image: imageUrl });

  return {
    success: true,
    message: "Category created successfully",
    data: category,
  };
};

export const getAllCategories = async () => {
  const categories = await categoryRepository.findAll();
  return {
    success: true,
    message: "Categories fetched successfully",
    data: categories,
  };
};

export const updateCategory = async (
  id: string,
  body: { name?: string; slug?: string },
  file?: Express.Multer.File,
) => {
  const category = await categoryRepository.findById(id);

  if (!category) {
    return { success: false, status: 404, message: "Category not found" };
  }

  let imageUrl = category.image;

  if (file) {
    if (category.image) {
      await deleteCategoryImage(category.image);
    }

    const result: any = await uploadToCloudinary("categories", file.buffer);
    imageUrl = result.secure_url;
  }

  const updated = await categoryRepository.updateById(id, {
    ...body,
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
