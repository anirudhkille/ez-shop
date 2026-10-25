import { useEffect, useMemo, useRef, useState } from "react";

import { useSearchParams } from "react-router";

import { useCategorys } from "@/features/category";
import type { TCategory } from "@/features/category";
import type { TProduct } from "@/features/product";

import {
  buildFacetParams,
  buildFilterParams,
} from "../lib/build-filter-params";
import { PRICE_MIN } from "../lib/constants";
import {
  countActiveFilters,
  defaultFilters,
  type FilterState,
  isPriceNarrowed,
  priceCeiling,
} from "../lib/filters";
import { useFilteredProducts, useProductFacets } from "./use-product";

export const SORT_OPTIONS = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating", label: "Top Rated" },
  { value: "newest", label: "Newest" },
];

const CATEGORY_PARAM = "category";

const matchesCategory = (cat: TCategory, key: string) =>
  cat._id === key ||
  cat.slug === key ||
  cat.name.toLowerCase() === key.toLowerCase();

const sameList = (a: string[], b: string[]) =>
  a.length === b.length && a.every((value, index) => value === b[index]);

export interface FilterChip {
  label: string;
  remove: () => void;
}

export const useProductFilters = () => {
  const { data: categories } = useCategorys();
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get(CATEGORY_PARAM) ?? "";

  const categoryIds = useMemo(() => {
    if (!categoryParam || !categories) return [];

    return categoryParam
      .split(",")
      .filter(Boolean)
      .map((key) => categories.find((cat) => matchesCategory(cat, key))?._id)
      .filter((id): id is string => Boolean(id));
  }, [categories, categoryParam]);

  const [sortBy, setSortBy] = useState("featured");
  const [sortOpen, setSortOpen] = useState(false);
  const [showFilter, setShowFilter] = useState(true);
  const [filters, setFilters] = useState<FilterState>(() => ({
    ...defaultFilters,
    categories: categoryIds,
  }));

  const [syncedCategoryParam, setSyncedCategoryParam] = useState<string | null>(
    categories ? categoryParam : null
  );

  if (categories && syncedCategoryParam !== categoryParam) {
    setSyncedCategoryParam(categoryParam);
    setFilters((current) =>
      sameList(current.categories, categoryIds)
        ? current
        : { ...current, categories: categoryIds }
    );
  }

  const facetParams = useMemo(() => buildFacetParams(filters), [filters]);
  const { data: facets } = useProductFacets(facetParams);
  const [, priceMax] = priceCeiling(facets?.price.max);
  const previousPriceMax = useRef(priceMax);

  useEffect(() => {
    const previous = previousPriceMax.current;
    previousPriceMax.current = priceMax;

    setFilters((current) => {
      const atCeiling = current.priceRange[1] >= previous;
      const nextMax = atCeiling
        ? priceMax
        : Math.min(current.priceRange[1], priceMax);

      if (nextMax === current.priceRange[1]) return current;

      return { ...current, priceRange: [current.priceRange[0], nextMax] };
    });
  }, [priceMax]);

  useEffect(() => {
    if (!categories) return;

    const nextCategory = filters.categories
      .map((id) => categories.find((cat) => cat._id === id)?.slug)
      .filter(Boolean)
      .join(",");

    if (nextCategory === categoryParam) return;

    setSearchParams(
      (current) => {
        const next = new URLSearchParams(current);

        if (nextCategory) next.set(CATEGORY_PARAM, nextCategory);
        else next.delete(CATEGORY_PARAM);

        return next;
      },
      { replace: true }
    );
  }, [categories, filters.categories, categoryParam, setSearchParams]);

  const categoryMap = useMemo(() => {
    const map: Record<string, string> = {};

    categories?.forEach((cat: TCategory) => {
      map[cat._id] = cat.name;
    });

    return map;
  }, [categories]);

  const selectedCategoryLabel = useMemo(() => {
    if (!categoryParam) return "All";

    const names = categoryParam
      .split(",")
      .filter(Boolean)
      .map(
        (key) =>
          categories?.find((cat: TCategory) => matchesCategory(cat, key))
            ?.name ?? key
      );

    return names.length ? names.join(", ") : "All";
  }, [categories, categoryParam]);

  const queryParams = useMemo(
    () => ({ ...buildFilterParams(filters, sortBy, priceMax), limit: 12 }),
    [filters, sortBy, priceMax]
  );

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useFilteredProducts(queryParams);

  const products: TProduct[] = data?.pages.flatMap((page) => page.data) ?? [];
  const total =
    (data?.pages[0] as { pagination?: { total?: number } } | undefined)
      ?.pagination?.total ?? 0;

  const activeFilterCount = countActiveFilters(filters, priceMax);
  const activeSort =
    SORT_OPTIONS.find((o) => o.value === sortBy) ?? SORT_OPTIONS[0];

  const clearFilters = () =>
    setFilters({ ...defaultFilters, priceRange: [PRICE_MIN, priceMax] });

  const removeFrom = <K extends "categories" | "colors" | "sizes">(
    key: K,
    value: string
  ) =>
    setFilters((f) => ({
      ...f,
      [key]: f[key].filter((x) => x !== value),
    }));

  const chips: FilterChip[] = [
    ...filters.categories.map((c) => ({
      label: categoryMap[c] || c,
      remove: () => removeFrom("categories", c),
    })),
    ...filters.colors.map((c) => ({
      label: c,
      remove: () => removeFrom("colors", c),
    })),
    ...filters.sizes.map((s) => ({
      label: `Size ${s}`,
      remove: () => removeFrom("sizes", s),
    })),
    ...(filters.minRating > 0
      ? [
          {
            label: `${filters.minRating}\u2605 & up`,
            remove: () => setFilters((f) => ({ ...f, minRating: 0 })),
          },
        ]
      : []),
    ...(isPriceNarrowed(filters, priceMax)
      ? [
          {
            label: `\u2264\u20b9${filters.priceRange[1]}`,
            remove: () =>
              setFilters((f) => ({ ...f, priceRange: [PRICE_MIN, priceMax] })),
          },
        ]
      : []),
  ];

  return {
    filters,
    setFilters,
    clearFilters,
    sortBy,
    setSortBy,
    sortOpen,
    setSortOpen,
    showFilter,
    setShowFilter,
    products,
    total,
    isLoading,
    activeFilterCount,
    activeSort,
    selectedCategoryLabel,
    chips,
    fetchNextPage,
    canLoadMore: !!hasNextPage && !isFetchingNextPage,
  };
};
