import { useNavigate } from "react-router";

import {
  keepPreviousData,
  useInfiniteQuery,
  useQuery,
} from "@tanstack/react-query";

import {
  getBestSellersProducts,
  getFeaturedProducts,
  getFilteredProducts,
  getProductBySlug,
  getProducts,
  getSimilarProducts,
  searchProducts,
} from "@/api/product";

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
  return useInfiniteQuery({
    queryKey: ["infinite-products", filters],

    queryFn: async ({ pageParam = 1 }) => {
      const res = await getFilteredProducts({
        ...filters,
        page: pageParam,
        limit: 12,
      });

      return res;
    },

    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage.pagination;

      return page < totalPages ? page + 1 : undefined;
    },

  });
};

export const useFeaturedProducts = () => {
  return useQuery({
    queryFn: getFeaturedProducts,
    queryKey: ["featured-product"],
    select: (res) => res?.data,
  });
};

export const useBestSellers = () => {
  return useQuery({
    queryFn: getBestSellersProducts,
    queryKey: ["best-sellers"],
    select: (res) => res?.data,
  });
};

export const useSimilarProducts = (id: string) => {
  return useQuery({
    queryFn: () => getSimilarProducts(id),
    queryKey: ["similar", id],
    select: (res) => res?.data,
    enabled: !!id,
  });
};

export const useSearchProducts = (query: string) => {
  return useQuery({
    queryFn: () => searchProducts(query),
    queryKey: ["search", query],
    select: (res) => res?.data,
    enabled: query.trim().length > 0,
  });
};
