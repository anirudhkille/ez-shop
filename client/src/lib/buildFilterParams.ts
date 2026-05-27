export const buildFilterParams = (filters: any, sortBy: string) => {
  const params: Record<string, any> = {};

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

  const sortMap: any = {
    "price-asc": "price-low",
    "price-desc": "price-high",
    newest: "newest",
    featured: "featured",
    rating: "rating",
  };

  if (sortBy) {
    params.sort = sortMap[sortBy] || "newest";
  }

  return params;
};
