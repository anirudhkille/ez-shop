import type { TApiResponse } from "@/shared/lib/api-response";
import { axiosInstance } from "@/shared/lib/axios-instance";

import type { TProductFacets } from "../types";

export const searchProducts = async (name: string, limit = 20) => {
  const res = await axiosInstance.get(`/product/search`, {
    params: { name, limit },
  });
  return res.data;
};

export const getProductBySlug = async (slug: string, id: string) => {
  const res = await axiosInstance.get(`/product/${slug}/${id}`);
  return res.data;
};

export const getFilteredProducts = async (params: Record<string, unknown>) => {
  const response = await axiosInstance.get("/product/filter", { params });
  return response.data;
};

export const getProductFacets = async () => {
  const res =
    await axiosInstance.get<TApiResponse<TProductFacets>>("/product/facets");
  return res.data;
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
