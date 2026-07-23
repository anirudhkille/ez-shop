import { asyncHandler } from "@/utils/asyncHandler";
import { Request, Response } from "express";
import * as productService from "@/modules/product/product.service";

export const postProduct = asyncHandler(async (req: Request, res: Response) => {
  const result = await productService.postProduct(req.body, (req as any).files);
  return res.status(result.status || 200).json(result.data);
});

export const getProducts = asyncHandler(async (req: Request, res: Response) => {
  const result = await productService.getProducts(req.query);
  return res.status(200).json(result.data);
});

export const getProductById = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await productService.getProductById(req.params.slug, req.params.id);
    return res.status(result.status || 200).json(result.data);
  },
);

export const updateProduct = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await productService.updateProduct(req.params.id, req.body, (req as any).files);
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
    const limit = Number(req.query.limit) || 10;
    const keyword = (req.query.name as string) || "";
    const result = await productService.getSearchProduct(keyword, limit);
    return res.status(200).json(result.data);
  },
);

export const getFilteredProducts = asyncHandler(async (req: any, res: any) => {
  const result = await productService.getFilteredProducts(req.query);
  return res.status(200).json(result.data);
});

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
