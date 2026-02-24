import axiosInstance from "@/lib/axiosInstance";

export const getProducts = async (params?: any) => {
  const res = await axiosInstance.get(`/product`, { params });
  return res.data;
};

export const getProduct = async (slug: string) => {
  const res = await axiosInstance.get(`/product/${slug}`);
  return res.data;
};

export const getFilteredProducts = async (params: Record<string, any>) => {
  const response = await axiosInstance.get("/product/filter", { params });
  return response.data;
};
