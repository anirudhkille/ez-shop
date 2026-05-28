import axiosInstance from "@/lib/axiosInstance";

export const getCart = async () => {
  const res = await axiosInstance.get("/cart");
  return res.data;
};

export const getCartCount = async () => {
  const res = await axiosInstance.get("/cart/count");
  return res.data;
};

export const addToCart = async (payload: {
  productId: string;
  variantId?: string;
  size?: string;
  quantity?: number;
}) => {
  const res = await axiosInstance.post("/cart/", payload);
  return res.data;
};

export const updateCartQuantity = async (payload: {
  cartItemId: string;
  quantity: number;
}) => {
  const res = await axiosInstance.put("/cart", payload);
  return res.data;
};

export const removeFromCart = async (cartItemId: string) => {
  const res = await axiosInstance.delete(`/cart/${cartItemId}`);
  return res.data;
};

export const clearCart = async () => {
  const res = await axiosInstance.delete("/cart/clear");
  return res.data;
};
