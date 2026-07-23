import { asyncHandler } from "@/utils/asyncHandler";
import { Response } from "express";
import * as wishlistService from "@/modules/wishlist/wishlist.service";

export const toggleWishlist = asyncHandler(async (req: any, res: Response) => {
  const { _id } = req.user;
  const { productId } = req.body;
  const result = await wishlistService.toggleWishlist(_id, productId);
  res.status(200).json(result.data);
});

export const getWishlistByUser = asyncHandler(
  async (req: any, res: Response) => {
    const { _id } = req.user;
    const result = await wishlistService.getWishlistByUser(_id);
    res.status(200).json(result.data);
  },
);

export const getWishlistDetails = asyncHandler(
  async (req: any, res: Response) => {
    const { _id } = req.user;
    const result = await wishlistService.getWishlistDetails(_id);
    res.status(200).json(result.data);
  },
);
