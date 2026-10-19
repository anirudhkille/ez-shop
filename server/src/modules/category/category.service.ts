import cloudinary from "@/config/cloudinary";
import { uploadToCloudinary } from "@/utils/upload-to-cloudinary";
import { AppError } from "@/utils/app-error";
import { createTtlCache } from "@/utils/ttl-cache";
import * as categoryRepository from "@/modules/category/category.repository";

const CATEGORY_CACHE_TTL_MS = 5 * 60 * 1000;

const categoryCache = createTtlCache<
  Awaited<ReturnType<typeof categoryRepository.findAll>>
>(CATEGORY_CACHE_TTL_MS);

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

  categoryCache.clear();

  return category;
};

export const getAllCategories = async (page = 1, limit = 10) => {
  const categories = await categoryCache.load(() =>
    categoryRepository.findAll(),
  );

  const start = (page - 1) * limit;
  const total = categories.length;

  return {
    items: categories.slice(start, start + limit),
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getCategoryById = async (id: string) => {
  const category = await categoryRepository.findById(id);

  if (!category) {
    throw new AppError("Category not found", 404);
  }

  return category;
};

export const updateCategory = async (
  id: string,
  body: { name?: string; slug?: string; image?: string },
  file?: Express.Multer.File,
) => {
  const category = await categoryRepository.findById(id);

  if (!category) {
    throw new AppError("Category not found", 404);
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

  categoryCache.clear();

  return updated;
};

export const deleteCategory = async (id: string) => {
  const category = await categoryRepository.deleteById(id);

  if (!category) {
    throw new AppError("Category not found", 404);
  }

  if (category.image) {
    await deleteCategoryImage(category.image);
  }

  categoryCache.clear();

  return category;
};
