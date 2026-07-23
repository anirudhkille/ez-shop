import * as wishlistRepository from "@/modules/wishlist/wishlist.repository";

export const toggleWishlist = async (userId: string, productId: string) => {
  let wishlist = await wishlistRepository.findOne({ user: userId });

  if (!wishlist) {
    wishlist = await wishlistRepository.create({
      user: userId,
      products: [productId],
    });

    return {
      data: {
        success: true,
        message: "Added to wishlist",
        action: "added",
        data: wishlist,
      },
    };
  }

  const exists = wishlist.products.some((id: any) => id.toString() === productId);

  let isAdded = false;

  if (exists) {
    wishlist.products = wishlist.products.filter(
      (id: any) => id.toString() !== productId,
    );
  } else {
    wishlist.products.push(productId as any);
    isAdded = true;
  }

  await wishlist.save();

  return {
    data: {
      success: true,
      message: isAdded ? "Added to wishlist" : "Removed from wishlist",
      action: isAdded ? "added" : "removed",
      data: wishlist,
    },
  };
};

export const getWishlistByUser = async (userId: string) => {
  const wishlist = await wishlistRepository.findOneLean({ user: userId });

  return {
    data: {
      success: true,
      message: "Wishlist fetched successfully",
      data: wishlist,
    },
  };
};

export const getWishlistDetails = async (userId: string) => {
  const wishlist = await wishlistRepository.findOnePopulated({ user: userId });

  return {
    data: {
      success: true,
      message: "Wishlist details fetched successfully",
      data: wishlist,
    },
  };
};
