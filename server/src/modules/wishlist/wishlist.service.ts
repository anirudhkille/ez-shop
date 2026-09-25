import mongoose from "mongoose";
import * as wishlistRepository from "@/modules/wishlist/wishlist.repository";

export const toggleWishlist = async (userId: string, productId: string) => {
  let wishlist = await wishlistRepository.findOne({ user: userId });

  if (!wishlist) {
    wishlist = await wishlistRepository.create({
      user: userId,
      products: [productId],
    });

    return { wishlist, action: "added" };
  }

  const exists = wishlist.products.some((id) => id.toString() === productId);

  let isAdded = false;

  if (exists) {
    wishlist.products = wishlist.products.filter(
      (id) => id.toString() !== productId,
    );
  } else {
    wishlist.products.push(productId as unknown as mongoose.Types.ObjectId);
    isAdded = true;
  }

  await wishlist.save();

  return { wishlist, action: isAdded ? "added" : "removed" };
};

export const getWishlistByUser = async (userId: string) => {
  const wishlist = await wishlistRepository.findOneLean({ user: userId });

  return wishlist;
};

export const getWishlistDetails = async (userId: string) => {
  const wishlist = await wishlistRepository.findOnePopulated({ user: userId });

  return wishlist;
};
