import { asyncHandler } from "@/middlewares/asyncHandler";
import Product from "@/models/Product";
import { Request, Response } from "express";
import { uploadToCloudinary } from "@/utils/uploadToCloudinary";
import slugify from "slugify";
import mongoose from "mongoose";

export const postProduct = asyncHandler(async (req: Request, res: Response) => {
  const body: any = req.body;

  if (typeof body.variants === "string") {
    body.variants = JSON.parse(body.variants);
  }

  if (typeof body.variantImageMap === "string") {
    body.variantImageMap = JSON.parse(body.variantImageMap);
  }

  const files = (req as any).files;
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

  const product = await Product.create(body);

  return res.status(201).json({
    success: true,
    message: "Product created successfully",
    data: product,
  });
});

export const getProducts = asyncHandler(async (req: Request, res: Response) => {
  const filter: any = {};

  if (req.query.publish) {
    filter.publish = req.query.publish === "true";
  }

  if (req.query.isFeatured) {
    filter.isFeatured = req.query.isFeatured === "true";
  }

  if (req.query.isNewArrival) {
    filter.isNewArrival = req.query.isNewArrival === "true";
  }

  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;

  const skip = (page - 1) * limit;

  const [product, total] = await Promise.all([
    Product.find(filter).skip(skip).limit(limit).populate("category"),
    Product.countDocuments(filter),
  ]);

  return res.status(200).json({
    success: true,
    message: "Product fetched successfully",
    data: product,
    pagintion: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  });
});

export const getProductById = asyncHandler(
  async (req: Request, res: Response) => {
    const { slug, id } = req.params;

    const product = await Product.findById(id).populate("category");

    if (!product) {
      return res.status(404).json({
        success: true,
        message: "Product not found",
      });
    }

    if (product.slug !== slug) {
      return res.status(200).json({
        success: true,
        redirectUrl: `/${product.slug}/${product._id}`,
        data: product,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Product fetched successfully",
      data: product,
    });
  },
);

export const updateProduct = asyncHandler(
  async (req: Request, res: Response) => {
    const body: any = req.body;

    if (typeof body.variants === "string") {
      body.variants = JSON.parse(body.variants);
    }

    const files = (req as any).files;
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

    const product = await Product.findByIdAndUpdate(req.params.id, body, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: product,
    });
  },
);

export const deleteProduct = asyncHandler(
  async (req: Request, res: Response) => {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    await product.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  },
);

export const getSearchProduct = asyncHandler(
  async (req: Request, res: Response) => {
    const limit = Number(req.query.limit) || 10;
    const keyword = (req.query.name as string) || "";

    const products = await Product.find({
      name: { $regex: keyword, $options: "i" },
    }).limit(limit);

    return res.status(200).json({
      success: true,
      message: "Search results fetched successfully",
      data: products,
    });
  },
);

export const getFilteredProducts = asyncHandler(async (req: any, res: any) => {
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
  } = req.query;

  const query: any = {
    publish: true,
  };

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ];
  }

  if (category) {
    const categories = category
      .split(",")
      .map((id: string) => new mongoose.Types.ObjectId(id));

    query.category = { $in: categories };
  }

  if (gender) {
    const genders = gender.split(",");
    query.gender = { $in: genders.map((g: string) => g.toLowerCase()) };
  }

  if (type) {
    const types = type.split(",");

    if (types.includes("New")) query.tag = "New";
    if (types.includes("Featured")) query.isFeatured = true;
    if (types.includes("Sale")) query.discountPrice = { $gt: 0 };
  }

  if (price) {
    const [min, max] = price.split("-").map(Number);

    query.$and = query.$and || [];

    query.$and.push({
      $or: [
        { discountPrice: { $gte: min, $lte: max } },
        { price: { $gte: min, $lte: max } },
      ],
    });
  }

  if (size) {
    const sizes = size.split(",");
    query["variants.sizes.size"] = { $in: sizes };
  }

  if (color) {
    const colors = color.split(",");
    query["variants.color"] = { $in: colors };
  }

  if (minRating) {
    query.rating = { $gte: Number(minRating) };
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
    Product.find(query).sort(sortOption).skip(skip).limit(limitNumber).lean(),

    Product.countDocuments(query),
  ]);

  return res.status(200).json({
    success: true,
    message: "Filtered products fetched successfully",
    data: products,
    pagination: {
      total,
      page: pageNumber,
      limit: limitNumber,
      totalPages: Math.ceil(total / limitNumber),
    },
  });
});

export const getFeaturedProducts = asyncHandler(
  async (req: Request, res: Response) => {
    const products = await Product.find({ publish: true, isFeatured: true })
      .select(
        "name slug image reviewsCount rating tag category price discountPrice",
      )
      .populate({ path: "category", select: "name" })
      .limit(8)
      .lean();

    res.json({
      success: true,
      messge: "Featured product fetched successfully",
      data: products,
    });
  },
);

export const getBestSellers = asyncHandler(
  async (req: Request, res: Response) => {
    const products = await Product.find({ publish: true, isBestSellers: true })
      .select("name slug image rating price discountPrice")
      .limit(6)
      .lean();

    res.json({
      success: true,
      messge: "Featured product fetched successfully",
      data: products,
    });
  },
);

export const getSimilarProducts = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const product = await Product.findById(id).select("category").lean();

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const similarProducts = await Product.find({
      _id: { $ne: id },
      category: product.category,
      publish: true,
    })
      .select("name slug image price discountPrice rating")
      .limit(4)
      .lean();

    return res.status(200).json({
      success: true,
      message: "Similar products fetched successfully",
      data: similarProducts,
    });
  },
);
