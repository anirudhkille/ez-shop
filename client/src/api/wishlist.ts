import axiosInstance from "@/lib/axiosInstance";

export const addToWishlist = async (productId: string) => {
  const res = await axiosInstance.post("/wishlist", { productId: productId });

  return res.data;
};

export const getWishlists = async () => {
  const res = await axiosInstance.get(`/wishlist`);
  return res.data;
};

export const removeFromWishlist = async (productId: string) => {
  const res = await axiosInstance.delete(`/wishlist/${productId}`);
  return res.data;
};
