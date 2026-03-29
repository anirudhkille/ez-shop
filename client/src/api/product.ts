import axiosInstance from "@/lib/axiosInstance";

export const getProducts = async (params?: any) => {
  const res = await axiosInstance.get(`/product`, { params });
  return res.data;
};

export const getProductBySlug = async (slug: string, id: string) => {
  const res = await axiosInstance.get(`/product/${slug}/${id}`);
  return res.data;
};

export const getFilteredProducts = async (params: Record<string, any>) => {
  const response = await axiosInstance.get("/product/filter", { params });
  return response.data;
};

export const getFeaturedProducts = async () => {
  const res = await axiosInstance.get(`/product/featured`);
  return res.data;
};

export const getBestSellersProducts = async () => {
  const res = await axiosInstance.get(`/product/best-sellers`);
  return res.data;
};

export const getSimilarProducts = async (id: string) => {
  const res = await axiosInstance.get(`/product/similar/${id}`);
  return res.data;
};
