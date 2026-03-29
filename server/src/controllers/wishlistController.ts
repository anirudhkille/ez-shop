import Wishlist from "@/models/Wishlist";
import { asyncHandler } from "@/middlewares/asyncHandler";
import { Request, Response } from "express";

export const toggleWishlist = asyncHandler(async (req: any, res: Response) => {
  const { _id } = req.user;
  const { productId } = req.body;

  let wishlist = await Wishlist.findOne({ user: _id });

  if (!wishlist) {
    wishlist = await Wishlist.create({
      user: _id,
      products: [productId],
    });

    return res.status(200).json({
      success: true,
      message: "Added to wishlist",
      action: "added",
      data: wishlist,
    });
  }

  const exists = wishlist.products.some((id) => id.toString() === productId);

  let isAdded = false;

  if (exists) {
    wishlist.products = wishlist.products.filter(
      (id) => id.toString() !== productId,
    );
  } else {
    wishlist.products.push(productId);
    isAdded = true;
  }

  await wishlist.save();

  res.status(200).json({
    success: true,
    message: isAdded ? "Added to wishlist" : "Removed from wishlist",
    action: isAdded ? "added" : "removed",
    data: wishlist,
  });
});

export const getWishlistByUser = asyncHandler(
  async (req: any, res: Response) => {
    const { _id } = req.user;

    const wishlist = await Wishlist.findOne({ user: _id })
      .lean();

    res.status(200).json({
      success: true,
      message: "Wishlist fetched successfully",
      data: wishlist,
    });
  },
);

export const getWishlistDetails = asyncHandler(
  async (req: any, res: Response) => {
    const { _id } = req.user;

    const wishlist = await Wishlist.findOne({ user: _id })
      .populate("products")
      .lean();

    res.status(200).json({
      success: true,
      message: "Wishlist details fetched successfully",
      data: wishlist,
    });
  }
);