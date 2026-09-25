import { asyncHandler } from "@/utils/asyncHandler";
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
  return res.status(result.status || 200).json(result.data);
});

export const getProducts = asyncHandler(async (req: Request, res: Response) => {
  const result = await productService.getProducts(
    req.query as ProductListQuery,
  );
  return res.status(200).json(result.data);
});

export const getProductById = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await productService.getProductById(
      req.params.slug,
      req.params.id,
    );
    return res.status(result.status || 200).json(result.data);
  },
);

export const updateProduct = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await productService.updateProduct(
      req.params.id,
      req.body,
      req.files,
    );
    return res.status(result.status || 200).json(result.data);
  },
);

export const deleteProduct = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await productService.deleteProduct(req.params.id);
    return res.status(result.status || 200).json(result.data);
  },
);

export const getSearchProduct = asyncHandler(
  async (req: Request, res: Response) => {
    const { name, limit } = req.query as unknown as ProductSearchQuery;
    const result = await productService.getSearchProduct(name, limit);
    return res.status(200).json(result.data);
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
    return res.status(200).json(result.data);
  },
);

export const getFeaturedProducts = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await productService.getFeaturedProducts();
    res.json(result.data);
  },
);

export const getBestSellers = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await productService.getBestSellers();
    res.json(result.data);
  },
);

export const getSimilarProducts = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await productService.getSimilarProducts(req.params.id);
    return res.status(result.status || 200).json(result.data);
  },
);
