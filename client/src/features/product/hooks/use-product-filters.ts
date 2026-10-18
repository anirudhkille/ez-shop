import { useMemo, useState } from "react";

import { useSearchParams } from "react-router";

import { useCategorys } from "@/features/category";
import type { TCategory } from "@/features/category";
import type { TProduct } from "@/features/product";

import { buildFilterParams } from "../lib/build-filter-params";
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

const matchesCategory = (cat: TCategory, key: string) =>
  cat._id === key ||
  cat.slug === key ||
  cat.name.toLowerCase() === key.toLowerCase();

export interface FilterChip {
  label: string;
  remove: () => void;
}

export const useProductFilters = () => {
  const { data: categories } = useCategorys();
  const { data: facets } = useProductFacets();
  const [params] = useSearchParams();
  const category = params.get("category");

  const [sortBy, setSortBy] = useState("featured");
  const [sortOpen, setSortOpen] = useState(false);
  const [showFilter, setShowFilter] = useState(true);
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [, priceMax] = priceCeiling(facets?.price.max);

  const [syncedPrice, setSyncedPrice] = useState(false);

  if (!syncedPrice && facets) {
    setSyncedPrice(true);
    setFilters((current) => ({
      ...current,
      priceRange: [PRICE_MIN, priceMax],
    }));
  }

  const categoryMap = useMemo(() => {
    const map: Record<string, string> = {};
    categories?.forEach((cat: TCategory) => {
      map[cat._id] = cat.name;
    });
    return map;
  }, [categories]);

  const selectedCategoryLabel = useMemo(() => {
    if (!category) return "All";
    return (
      categories?.find((cat: TCategory) => matchesCategory(cat, category))
        ?.name ?? category
    );
  }, [categories, category]);

  const urlCategory = useMemo(() => {
    if (!category) return "all";
    const matched = categories?.find((cat: TCategory) =>
      matchesCategory(cat, category)
    );
    return matched?._id ?? "none";
  }, [categories, category]);

  const [syncedCategory, setSyncedCategory] = useState(urlCategory);

  if (syncedCategory !== urlCategory) {
    setSyncedCategory(urlCategory);
    const target =
      urlCategory === "all" || urlCategory === "none" ? [] : [urlCategory];

    setFilters((f) =>
      f.categories.join(",") === target.join(",")
        ? f
        : { ...f, categories: target }
    );
  }

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
