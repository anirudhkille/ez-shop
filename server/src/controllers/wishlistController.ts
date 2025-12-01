import Wishlist from "../models/Wishlist";
import { asyncHandler } from "../middlewares/asyncHandler";
import { Request, Response } from "express";

export const addToWishlist = asyncHandler(async (req: any, res: Response) => {
  const { _id } = req.user;
  const wishlist = await Wishlist.findOneAndUpdate(
    { user: _id },
    { $addToSet: { products: req.body.productId } },
    { upsert: true, new: true }
  );

  res.status(201).json({
    success: true,
    message: "wishlist created successfully",
    data: wishlist,
  });
});

export const getWishlistByUser = asyncHandler(
  async (req: any, res: Response) => {
    const { _id } = req.user;

    const wishlist = await Wishlist.findOne({ user: _id })
      .populate("products")
      .lean();

    res.status(200).json({
      success: true,
      message: "Wishlist fetched successfully",
      data: wishlist,
    });
  }
);

export const removeFromWishlist = asyncHandler(
  async (req: any, res: Response) => {
    const { _id } = req.user;
    const { productId } = req.params;

    const wishlist = await Wishlist.findOneAndUpdate(
      { user: _id },
      { $pull: { products: productId } },
      { upsert: true, new: true }
    );

    if (!wishlist) {
      res.status(404).json({
        success: false,
        message: "Wishlist not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Wishlist deleted successfully",
    });
  }
);
