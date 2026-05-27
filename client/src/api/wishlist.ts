import axiosInstance from "@/lib/axiosInstance";

export const toggleWishlist = async (productId: string) => {
  const res = await axiosInstance.post("/wishlist/toggle", { productId: productId });

  return res.data;
};

export const getWishlists = async () => {
  const res = await axiosInstance.get(`/wishlist`);
  return res.data;
};

export const getWishlistDetails = async () => {
  const res = await axiosInstance.get("/wishlist/details");
  return res.data;
};
