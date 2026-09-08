import { asyncHandler } from "@/utils/asyncHandler";
import { Request, Response } from "express";
import * as productService from "@/modules/product/product.service";
import {
  objectIdParamSchema,
  productQuerySchema,
  searchQuerySchema,
} from "@/modules/product/product.schema";

const formatZodError = (error: any) =>
  error.errors.map((e: any) => e.message).join(", ");

export const postProduct = asyncHandler(async (req: Request, res: Response) => {
  const result = await productService.postProduct(req.body, (req as any).files);
  return res.status(result.status || 200).json(result.data);
});

export const getProducts = asyncHandler(async (req: Request, res: Response) => {
  const parsed = productQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    return res
      .status(400)
      .json({ success: false, message: formatZodError(parsed.error) });
  }

  const result = await productService.getProducts(parsed.data);
  return res.status(200).json(result.data);
});

export const getProductById = asyncHandler(
  async (req: Request, res: Response) => {
    const paramsParsed = objectIdParamSchema.safeParse({ id: req.params.id });
    if (!paramsParsed.success) {
      return res
        .status(400)
        .json({ success: false, message: formatZodError(paramsParsed.error) });
    }

    const result = await productService.getProductById(
      req.params.slug,
      paramsParsed.data.id,
    );
    return res.status(result.status || 200).json(result.data);
  },
);

export const updateProduct = asyncHandler(
  async (req: Request, res: Response) => {
    const paramsParsed = objectIdParamSchema.safeParse(req.params);
    if (!paramsParsed.success) {
      return res
        .status(400)
        .json({ success: false, message: formatZodError(paramsParsed.error) });
    }

    const result = await productService.updateProduct(
      paramsParsed.data.id,
      req.body,
      (req as any).files,
    );
    return res.status(result.status || 200).json(result.data);
  },
);

export const deleteProduct = asyncHandler(
  async (req: Request, res: Response) => {
    const paramsParsed = objectIdParamSchema.safeParse(req.params);
    if (!paramsParsed.success) {
      return res
        .status(400)
        .json({ success: false, message: formatZodError(paramsParsed.error) });
    }

    const result = await productService.deleteProduct(paramsParsed.data.id);
    return res.status(result.status || 200).json(result.data);
  },
);

export const getSearchProduct = asyncHandler(
  async (req: Request, res: Response) => {
    const parsed = searchQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      return res
        .status(400)
        .json({ success: false, message: formatZodError(parsed.error) });
    }

    const result = await productService.getSearchProduct(
      parsed.data.name,
      parsed.data.limit,
    );
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
    const paramsParsed = objectIdParamSchema.safeParse(req.params);
    if (!paramsParsed.success) {
      return res
        .status(400)
        .json({ success: false, message: formatZodError(paramsParsed.error) });
    }

    const result = await productService.getSimilarProducts(paramsParsed.data.id);
    return res.status(result.status || 200).json(result.data);
  },
);
