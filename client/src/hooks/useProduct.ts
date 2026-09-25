import { useEffect } from "react";

import { useNavigate } from "react-router";

import { useInfiniteQuery, useQuery } from "@tanstack/react-query";

import type { TProduct } from "@/types/product";

import {
  getBestSellersProducts,
  getFeaturedProducts,
  getFilteredProducts,
  getProductBySlug,
  getSimilarProducts,
  searchProducts,
} from "@/api/product";

export const useProduct = (slug: string, id: string) => {
  const navigate = useNavigate();

  const query = useQuery({
    queryFn: () => getProductBySlug(slug, id),
    queryKey: ["product", id],
    enabled: !!id,
  });

  const product: TProduct | null = query.data?.data ?? null;
  const redirectUrl = query.data?.data?.redirectUrl;

  useEffect(() => {
    if (redirectUrl) {
      navigate(`/${redirectUrl}`, { replace: true });
    }
  }, [redirectUrl, navigate]);

  return { ...query, data: product };
};

interface FilteredPage {
  data: TProduct[];
  pagination: { page: number; totalPages: number };
}

export const useFilteredProducts = (filters: Record<string, unknown>) => {
  return useInfiniteQuery({
    queryKey: ["infinite-products", filters],
    initialPageParam: 1,

    queryFn: async ({ pageParam }) => {
      const res = await getFilteredProducts({
        ...filters,
        page: pageParam,
        limit: 12,
      });

      return res;
    },

    getNextPageParam: (lastPage: FilteredPage) => {
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
