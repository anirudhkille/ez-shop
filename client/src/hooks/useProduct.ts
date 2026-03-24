import { keepPreviousData, useQuery } from "@tanstack/react-query";

import {
  getFeaturedProducts,
  getFilteredProducts,
  getProductBySlug,
  getProducts,
} from "@/api/product";
import { useNavigate } from "react-router";

export const useProducts = (filters?: any) => {
  return useQuery({
    queryFn: () => getProducts(filters),
    queryKey: ["product", filters],
    placeholderData: keepPreviousData,
  });
};

export const useProduct = (slug: string, id: string) => {
   const navigate = useNavigate();
  return useQuery({
    queryFn: () => getProductBySlug(slug, id),
    queryKey: ["product", id],
    select: (res) => {
      if (res.redirectUrl) {
        navigate(`/${res.redirectUrl}`, { replace: true });
        return null;
      }

      return res.data;
    },
    enabled: !!id,
  });
};

export const useFilteredProducts = (filters: Record<string, any>) => {
  return useQuery({
    queryKey: ["filtered-products", filters],
    queryFn: () => getFilteredProducts(filters),
    staleTime: 1000 * 60 * 5,
  });
};

export const useFeaturedProducts = () => {
  return useQuery({
    queryFn: getFeaturedProducts,
    queryKey: ["featured-product"],
    select: (res) => res?.data,
    staleTime: 5 * 60 * 100,
  });
};
