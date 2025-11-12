import { asyncHandler } from "../middlewares/asyncHandler";
import Product from "../models/Product";
import { Request, Response } from "express";

export const postProduct = asyncHandler(async (req: Request, res: Response) => {
  const product = new Product(req.body);
  product.save();

  return res.status(201).json({
    success: true,
    message: "Product created successfully",
    data: product,
  });
});

export const getProduct = asyncHandler(async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;

  const skip = (page - 1) * limit;

  const [product, total] = await Promise.all([
    Product.find().skip(skip).limit(limit),
    Product.countDocuments(),
  ]);

  if (product.length === 0) {
    return res.status(404).json({
      success: true,
      message: "Product not found",
    });
  }

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
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: true,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Product fetched successfully",
      data: product,
    });
  }
);

export const updateProduct = asyncHandler(
  async (req: Request, res: Response) => {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { new: true }
    );

    if (!product)
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });

    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: product,
    });
  }
);

export const deleteProduct = asyncHandler(
  async (req: Request, res: Response) => {
    const product = Product.findByIdAndDelete(req.params.id);

    if (!product)
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });

    return res.status(200).json({
      success: true,
      message: "Product deleted successfully",
      data: product,
    });
  }
);

export const getSearchProduct = asyncHandler(
  async (req: Request, res: Response) => {
    const limit = Number(req.query.limit) || 10;
    const keyword = req.query.name || "";

    const products = await Product.find({
      name: { $regex: keyword, $options: "i" },
    }).limit(limit);

    if (products.length === 0) {
      return res.status(404).json({
        success: true,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Search results fetched successfully",
      data: products,
    });
  }
);
