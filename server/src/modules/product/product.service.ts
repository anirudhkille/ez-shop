import { uploadToCloudinary } from "@/utils/uploadToCloudinary";
import { AppError } from "@/utils/appError";
import slugify from "slugify";
import mongoose from "mongoose";
import { IProduct, IVariant } from "@/modules/product/product.model";
import * as productRepository from "@/modules/product/product.repository";
import type { FilterQuery } from "mongoose";

interface VariantImageMap {
  variantIndex: number;
  count: number;
}

interface ProductBody {
  name: string;
  description?: string;
  category?: IProduct["category"];
  price?: number;
  discountPrice?: number;
  gender?: IProduct["gender"];
  stock?: number;
  isFeatured?: boolean;
  isBestSellers?: boolean;
  tag?: string;
  publish?: boolean;
  image?: string;
  slug?: string;
  variants?: string | IVariant[];
  variantImageMap?: string | VariantImageMap[];
}

interface ProductQuery {
  publish?: string;
  isFeatured?: string;
  isNewArrival?: string;
  page?: number;
  limit?: number;
}

interface FilteredProductsQuery {
  search?: string;
  category?: string;
  gender?: string;
  type?: string;
  price?: string;
  size?: string;
  color?: string;
  sort?: string;
  minRating?: string;
  page?: string;
  limit?: string;
}

type ProductFilter = FilterQuery<IProduct> & { isNewArrival?: boolean };

type FilteredDBQuery = FilterQuery<IProduct> & {
  "variants.sizes.size"?: { $in: string[] };
  "variants.color"?: { $in: string[] };
};

type UploadedFiles =
  | Express.Multer.File[]
  | { [fieldname: string]: Express.Multer.File[] };

export const decrementStock = async (
  items: {
    product: string;
    variantId?: string;
    size?: string;
    quantity: number;
  }[],
) => {
  for (const item of items) {
    if (!item.quantity || item.quantity <= 0) continue;

    if (item.variantId && item.size) {
      const product = await productRepository.findById(item.product);
      if (!product) continue;

      const variant = product.variants.find(
        (v) => String(v._id) === item.variantId,
      );
      const sizeObj = variant?.sizes.find((s) => s.size === item.size);

      if (sizeObj) {
        sizeObj.stock = Math.max(0, sizeObj.stock - item.quantity);
        await product.save();
      }
    } else {
      await productRepository.decrementStock(item.product, item.quantity);
    }
  }
};

export const verifyStock = async (
  items: {
    product: string;
    variantId?: string;
    size?: string;
    quantity: number;
  }[],
): Promise<string | null> => {
  for (const item of items) {
    if (!item.quantity || item.quantity <= 0) continue;

    const product = await productRepository.findById(item.product);
    if (!product || !product.publish) {
      return "One or more products are no longer available";
    }

    if (item.variantId && item.size) {
      const variant = product.variants.find(
        (v) => String(v._id) === item.variantId,
      );
      const sizeObj = variant?.sizes.find((s) => s.size === item.size);

      if (!sizeObj) {
        return "Selected size or variant is unavailable";
      }

      if (sizeObj.stock < item.quantity) {
        return `Only ${sizeObj.stock} items available for ${product.name} (size ${item.size})`;
      }
    } else {
      if (product.stock < item.quantity) {
        return `Only ${product.stock} items available for ${product.name}`;
      }
    }
  }

  return null;
};

export const postProduct = async (body: ProductBody, files?: UploadedFiles) => {
  const variants: IVariant[] =
    typeof body.variants === "string"
      ? JSON.parse(body.variants)
      : (body.variants ?? []);

  const variantImageMap: VariantImageMap[] =
    typeof body.variantImageMap === "string"
      ? JSON.parse(body.variantImageMap)
      : (body.variantImageMap ?? []);

  if (files && !Array.isArray(files) && files.image) {
    const file = files.image[0];
    const result = await uploadToCloudinary("products", file.buffer);
    body.image = result.secure_url;
  }

  if (files && !Array.isArray(files) && files.variantImages) {
    const variantFiles = files.variantImages;

    let fileIndex = 0;

    for (const map of variantImageMap) {
      const { variantIndex, count } = map;

      variants[variantIndex].images = [];

      for (let i = 0; i < count; i++) {
        const result = await uploadToCloudinary(
          "products/variants",
          variantFiles[fileIndex].buffer,
        );

        variants[variantIndex].images.push(result.secure_url);
        fileIndex++;
      }
    }
  }

  body.slug = slugify(body.name, { lower: true, strict: true });

  const product = await productRepository.create({
    ...body,
    variants,
    variantImageMap,
  });

  return product;
};

export const getProducts = async (query: ProductQuery) => {
  const filter: ProductFilter = {};

  if (query.publish) {
    filter.publish = query.publish === "true";
  }

  if (query.isFeatured) {
    filter.isFeatured = query.isFeatured === "true";
  }

  if (query.isNewArrival) {
    filter.isNewArrival = query.isNewArrival === "true";
  }

  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;

  const skip = (page - 1) * limit;

  const [product, total] = await Promise.all([
    productRepository.find(filter, skip, limit),
    productRepository.countDocuments(filter),
  ]);

  return {
    items: product,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getProductById = async (slug: string, id: string) => {
  const product = await productRepository.findById(id);

  if (!product) {
    throw new AppError("Product not found", 404);
  }

  if (product.slug !== slug) {
    return {
      product,
      redirectUrl: `/${product.slug}/${product._id}`,
    };
  }

  return { product };
};

export const updateProduct = async (
  id: string,
  body: ProductBody,
  files?: UploadedFiles,
) => {
  const variants: IVariant[] =
    typeof body.variants === "string"
      ? JSON.parse(body.variants)
      : (body.variants ?? []);

  if (files && !Array.isArray(files) && files.image) {
    const file = files.image[0];
    const result = await uploadToCloudinary("products", file.buffer);
    body.image = result.secure_url;
  }

  if (files && !Array.isArray(files) && files.variantImages) {
    const variantFiles = files.variantImages;

    for (let i = 0; i < variantFiles.length; i++) {
      const result = await uploadToCloudinary(
        "products/variants",
        variantFiles[i].buffer,
      );

      if (variants[i]) {
        variants[i].images = [result.secure_url];
      }
    }
  }

  if (body.name) {
    body.slug = slugify(body.name, { lower: true, strict: true });
  }

  const product = await productRepository.findByIdAndUpdate(id, {
    ...body,
    variants,
  });

  if (!product) {
    throw new AppError("Product not found", 404);
  }

  return product;
};

export const deleteProduct = async (id: string) => {
  const product = await productRepository.findByIdAndDelete(id);

  if (!product) {
    throw new AppError("Product not found", 404);
  }

  return product;
};

export const getSearchProduct = async (keyword: string, limit: number) => {
  const products = await productRepository.findSearch(keyword, limit);

  return products;
};

export const getFilteredProducts = async (query: FilteredProductsQuery) => {
  const {
    search,
    category,
    gender,
    type,
    price,
    size,
    color,
    sort,
    minRating,
    page = 1,
    limit = 20,
  } = query;

  const dbQuery: FilteredDBQuery = {
    publish: true,
  };

  if (search) {
    dbQuery.$or = [
      { name: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ];
  }

  if (category) {
    const categories = category
      .split(",")
      .map((id: string) => new mongoose.Types.ObjectId(id));

    dbQuery.category = { $in: categories };
  }

  if (gender) {
    const genders = gender.split(",");
    dbQuery.gender = { $in: genders.map((g: string) => g.toLowerCase()) };
  }

  if (type) {
    const types = type.split(",");

    if (types.includes("New")) dbQuery.tag = "New";
    if (types.includes("Featured")) dbQuery.isFeatured = true;
    if (types.includes("Sale")) dbQuery.discountPrice = { $gt: 0 };
  }

  if (price) {
    const [min, max] = price.split("-").map(Number);

    dbQuery.$and = dbQuery.$and || [];

    dbQuery.$and.push({
      $or: [
        { discountPrice: { $gte: min, $lte: max } },
        { price: { $gte: min, $lte: max } },
      ],
    });
  }

  if (size) {
    const sizes = size.split(",");
    dbQuery["variants.sizes.size"] = { $in: sizes };
  }

  if (color) {
    const colors = color.split(",");
    dbQuery["variants.color"] = { $in: colors };
  }

  if (minRating) {
    dbQuery.rating = { $gte: Number(minRating) };
  }

  let sortOption: Record<string, 1 | -1> = { createdAt: -1 };

  switch (sort) {
    case "price-low":
      sortOption = { discountPrice: 1, price: 1 };
      break;
    case "price-high":
      sortOption = { discountPrice: -1, price: -1 };
      break;
    case "newest":
      sortOption = { createdAt: -1 };
      break;
    case "featured":
      sortOption = { isFeatured: -1 };
      break;
    case "rating":
      sortOption = { rating: -1 };
      break;
  }

  const pageNumber = Number(page);
  const limitNumber = Number(limit);
  const skip = (pageNumber - 1) * limitNumber;

  const [products, total] = await Promise.all([
    productRepository.findFiltered(dbQuery, sortOption, skip, limitNumber),
    productRepository.countDocuments(dbQuery),
  ]);

  return {
    items: products,
    pagination: {
      total,
      page: pageNumber,
      limit: limitNumber,
      totalPages: Math.ceil(total / limitNumber),
    },
  };
};

export const getFeaturedProducts = async () => {
  const products = await productRepository.findFeatured();

  return products;
};

export const getBestSellers = async () => {
  const products = await productRepository.findBestSellers();

  return products;
};

export const getSimilarProducts = async (id: string) => {
  const product = await productRepository.findByIdSelect(id, "category");

  if (!product) {
    throw new AppError("Product not found", 404);
  }

  const similarProducts = await productRepository.findSimilar(
    id,
    product.category as unknown as mongoose.Types.ObjectId,
  );

  return similarProducts;
};
