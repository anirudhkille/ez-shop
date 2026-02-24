import { getFilteredProducts, getProduct, getProducts } from "@/api/product";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

export const useProducts = (filters?: any) => {
  return useQuery({
    queryFn: () => getProducts(filters),
    queryKey: ["product", filters],
    placeholderData: keepPreviousData,
  });
};

export const useProduct = (slug: string) => {
  return useQuery({
    queryFn: () => getProduct(slug),
    queryKey: ["product", slug],
    enabled: !!slug,
  });
};

export const useFilteredProducts = (filters: Record<string, any>) => {
  return useQuery({
    queryKey: ["filtered-products", filters],
    queryFn: () => getFilteredProducts(filters),
    staleTime: 1000 * 60 * 5,
  });
};
