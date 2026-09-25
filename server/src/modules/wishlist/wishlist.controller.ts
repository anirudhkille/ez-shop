import { asyncHandler } from "@/utils/asyncHandler";
import { sendResponse } from "@/utils/response";
import { Request, Response } from "express";
import * as wishlistService from "@/modules/wishlist/wishlist.service";

export const toggleWishlist = asyncHandler(
  async (req: Request, res: Response) => {
    const { _id } = req.user!;
    const { productId } = req.body;
    const result = await wishlistService.toggleWishlist(_id, productId);

    const message =
      result.action === "added" ? "Added to wishlist" : "Removed from wishlist";

    return sendResponse(res, 200, message, {
      ...result.wishlist,
      action: result.action,
    });
  },
);

export const getWishlistByUser = asyncHandler(
  async (req: Request, res: Response) => {
    const { _id } = req.user!;
    const result = await wishlistService.getWishlistByUser(_id);

    return sendResponse(res, 200, "Wishlist fetched successfully", result);
  },
);

export const getWishlistDetails = asyncHandler(
  async (req: Request, res: Response) => {
    const { _id } = req.user!;
    const result = await wishlistService.getWishlistDetails(_id);

    return sendResponse(
      res,
      200,
      "Wishlist details fetched successfully",
      result,
    );
  },
);
