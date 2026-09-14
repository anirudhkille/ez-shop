import type { FilterState } from "@/features/product/filters";

const sortMap: Record<string, string> = {
  "price-asc": "price-low",
  "price-desc": "price-high",
  newest: "newest",
  featured: "featured",
  rating: "rating",
};

export const buildFilterParams = (
  filters: FilterState,
  sortBy: string
): Record<string, string | number> => {
  const params: Record<string, string | number> = {};

  if (filters.categories?.length) {
    params.category = filters.categories.join(",");
  }

  if (filters.priceRange) {
    params.price = `${filters.priceRange[0]}-${filters.priceRange[1]}`;
  }

  if (filters.sizes?.length) {
    params.size = filters.sizes.join(",");
  }

  if (filters.colors?.length) {
    params.color = filters.colors.join(",");
  }

  if (filters.minRating > 0) {
    params.minRating = filters.minRating;
  }

  if (sortBy) {
    params.sort = sortMap[sortBy] || "newest";
  }

  return params;
};
