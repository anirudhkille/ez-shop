import { asyncHandler } from "@/utils/asyncHandler";
import { sendResponse } from "@/utils/response";
import { Request, Response } from "express";
import * as productService from "@/modules/product/product.service";

type ProductListQuery = {
  publish?: string;
  isFeatured?: string;
  isNewArrival?: string;
  page?: number;
  limit?: number;
};

type ProductSearchQuery = {
  name: string;
  limit: number;
};

const queryString = (value: unknown): string | undefined =>
  typeof value === "string" || typeof value === "number"
    ? String(value)
    : undefined;

export const postProduct = asyncHandler(async (req: Request, res: Response) => {
  const result = await productService.postProduct(req.body, req.files);

  return sendResponse(res, 201, "Product created successfully", result);
});

export const getProducts = asyncHandler(async (req: Request, res: Response) => {
  const result = await productService.getProducts(
    req.query as ProductListQuery,
  );

  return sendResponse(
    res,
    200,
    "Products fetched successfully",
    result.items,
    result.pagination,
  );
});

export const getProductById = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await productService.getProductById(
      req.params.slug,
      req.params.id,
    );

    if (result.redirectUrl) {
      return sendResponse(res, 200, "Product fetched successfully", {
        ...result.product,
        redirectUrl: result.redirectUrl,
      });
    }

    return sendResponse(
      res,
      200,
      "Product fetched successfully",
      result.product,
    );
  },
);

export const updateProduct = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await productService.updateProduct(
      req.params.id,
      req.body,
      req.files,
    );

    return sendResponse(res, 200, "Product updated successfully", result);
  },
);

export const deleteProduct = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await productService.deleteProduct(req.params.id);

    return sendResponse(res, 200, "Product deleted successfully", result);
  },
);

export const getSearchProduct = asyncHandler(
  async (req: Request, res: Response) => {
    const { name, limit } = req.query as unknown as ProductSearchQuery;
    const result = await productService.getSearchProduct(name, limit);

    return sendResponse(
      res,
      200,
      "Search results fetched successfully",
      result,
    );
  },
);

export const getFilteredProducts = asyncHandler(
  async (req: Request, res: Response) => {
    const query = req.query;
    const result = await productService.getFilteredProducts({
      search: queryString(query.search),
      category: queryString(query.category),
      gender: queryString(query.gender),
      type: queryString(query.type),
      price: queryString(query.price),
      size: queryString(query.size),
      color: queryString(query.color),
      sort: queryString(query.sort),
      minRating: queryString(query.minRating),
      page: queryString(query.page),
      limit: queryString(query.limit),
    });

    return sendResponse(
      res,
      200,
      "Products fetched successfully",
      result.items,
      result.pagination,
    );
  },
);

export const getFeaturedProducts = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await productService.getFeaturedProducts();

    return sendResponse(
      res,
      200,
      "Featured products fetched successfully",
      result,
    );
  },
);

export const getBestSellers = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await productService.getBestSellers();

    return sendResponse(res, 200, "Best sellers fetched successfully", result);
  },
);

export const getSimilarProducts = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await productService.getSimilarProducts(req.params.id);

    return sendResponse(
      res,
      200,
      "Similar products fetched successfully",
      result,
    );
  },
);
