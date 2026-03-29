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

    staleTime: 1000 * 60 * 5,
    keepPreviousData: true,
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

export const useBestSellers = () => {
  return useQuery({
    queryFn: getBestSellersProducts,
    queryKey: ["best-sellers"],
    select: (res) => res?.data,
    staleTime: 5 * 60 * 100,
  });
};

export const useSimilarProducts = (id: string) => {
  return useQuery({
    queryFn: () => getSimilarProducts(id),
    queryKey: ["similar", id],
    select: (res) => res?.data,
    staleTime: 5 * 60 * 100,
    enabled: !!id,
  });
};
