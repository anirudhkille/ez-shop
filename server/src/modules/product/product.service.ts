import { uploadToCloudinary } from "@/utils/uploadToCloudinary";
import slugify from "slugify";
import mongoose from "mongoose";
import Product from "@/modules/product/product.model";
import * as productRepository from "@/modules/product/product.repository";

export const decrementStock = async (
  items: { product: string; variantId?: string; size?: string; quantity: number }[],
) => {
  for (const item of items) {
    if (!item.quantity || item.quantity <= 0) continue;

    if (item.variantId && item.size) {
      const product = await Product.findById(item.product);
      if (!product) continue;

      const variant = product.variants.find(
        (v) => (v as any)._id.toString() === item.variantId,
      );
      const sizeObj = variant?.sizes.find((s) => s.size === item.size);

      if (sizeObj) {
        sizeObj.stock = Math.max(0, sizeObj.stock - item.quantity);
        await product.save();
      }
    } else {
      await Product.updateOne(
        { _id: item.product },
        { $inc: { stock: -item.quantity } },
      );
    }
  }
};

export const verifyStock = async (
  items: { product: string; variantId?: string; size?: string; quantity: number }[],
): Promise<string | null> => {
  for (const item of items) {
    if (!item.quantity || item.quantity <= 0) continue;

    const product = await Product.findById(item.product);
    if (!product || !product.publish) {
      return "One or more products are no longer available";
    }

    if (item.variantId && item.size) {
      const variant = product.variants.find(
        (v) => (v as any)._id.toString() === item.variantId,
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

export const postProduct = async (body: any, files: any) => {
  if (typeof body.variants === "string") {
    body.variants = JSON.parse(body.variants);
  }

  if (typeof body.variantImageMap === "string") {
    body.variantImageMap = JSON.parse(body.variantImageMap);
  }

  if (files && files.image) {
    const file = files.image[0];
    const result: any = await uploadToCloudinary("products", file.buffer);
    body.image = result.secure_url;
  }

  if (files && files.variantImages) {
    const variantFiles = files.variantImages;

    let fileIndex = 0;

    for (const map of body.variantImageMap) {
      const { variantIndex, count } = map;

      body.variants[variantIndex].images = [];

      for (let i = 0; i < count; i++) {
        const result: any = await uploadToCloudinary(
          "products/variants",
          variantFiles[fileIndex].buffer,
        );

        body.variants[variantIndex].images.push(result.secure_url);
        fileIndex++;
      }
    }
  }

  body.slug = slugify(body.name, { lower: true, strict: true });

  const product = await productRepository.create(body);

  return {
    data: {
      success: true,
      message: "Product created successfully",
      data: product,
    },
    status: 201,
  };
};

export const getProducts = async (query: any) => {
  const filter: any = {};

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
    data: {
      success: true,
      message: "Product fetched successfully",
      data: product,
      pagintion: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    },
  };
};

export const getProductById = async (slug: string, id: string) => {
  const product = await productRepository.findById(id);

  if (!product) {
    return { status: 404, data: { success: true, message: "Product not found" } };
  }

  if (product.slug !== slug) {
    return {
      data: {
        success: true,
        redirectUrl: `/${product.slug}/${product._id}`,
        data: product,
      },
    };
  }

  return {
    data: {
      success: true,
      message: "Product fetched successfully",
      data: product,
    },
  };
};

export const updateProduct = async (id: string, body: any, files: any) => {
  if (typeof body.variants === "string") {
    body.variants = JSON.parse(body.variants);
  }

  if (files && files.image) {
    const file = files.image[0];
    const result: any = await uploadToCloudinary("products", file.buffer);
    body.image = result.secure_url;
  }

  if (files && files.variantImages) {
    const variantFiles = files.variantImages;

    for (let i = 0; i < variantFiles.length; i++) {
      const result: any = await uploadToCloudinary(
        "products/variants",
        variantFiles[i].buffer,
      );

      if (body.variants && body.variants[i]) {
        body.variants[i].images = [result.secure_url];
      }
    }
  }

  if (body.name) {
    body.slug = slugify(body.name, { lower: true, strict: true });
  }

  const product = await productRepository.findByIdAndUpdate(id, body);

  if (!product) {
    return { status: 404, data: { success: false, message: "Product not found" } };
  }

  return {
    data: {
      success: true,
      message: "Product updated successfully",
      data: product,
    },
  };
};

export const deleteProduct = async (id: string) => {
  const product = await productRepository.findByIdAndDelete(id);

  if (!product) {
    return { status: 404, data: { success: false, message: "Product not found" } };
  }

  return {
    data: {
      success: true,
      message: "Product deleted successfully",
    },
  };
};

export const getSearchProduct = async (keyword: string, limit: number) => {
  const products = await productRepository.findSearch(keyword, limit);

  return {
    data: {
      success: true,
      message: "Search results fetched successfully",
      data: products,
    },
  };
};

export const getFilteredProducts = async (query: any) => {
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

  const dbQuery: any = {
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

  let sortOption: any = { createdAt: -1 };

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
    data: {
      success: true,
      message: "Filtered products fetched successfully",
      data: products,
      pagination: {
        total,
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(total / limitNumber),
      },
    },
  };
};

export const getFeaturedProducts = async () => {
  const products = await productRepository.findFeatured();

  return {
    data: {
      success: true,
      messge: "Featured product fetched successfully",
      data: products,
    },
  };
};

export const getBestSellers = async () => {
  const products = await productRepository.findBestSellers();

  return {
    data: {
      success: true,
      messge: "Featured product fetched successfully",
      data: products,
    },
  };
};

export const getSimilarProducts = async (id: string) => {
  const product = await productRepository.findByIdSelect(id, "category");

  if (!product) {
    return { status: 404, data: { success: false, message: "Product not found" } };
  }

  const similarProducts = await productRepository.findSimilar(id, product.category);

  return {
    data: {
      success: true,
      message: "Similar products fetched successfully",
      data: similarProducts,
    },
  };
};
