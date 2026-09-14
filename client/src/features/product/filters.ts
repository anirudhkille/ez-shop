export interface FilterState {
  categories: string[];
  priceRange: [number, number];
  sizes: string[];
  colors: string[];
  minRating: number;
}

export const defaultFilters: FilterState = {
  categories: [],
  priceRange: [0, 20000],
  sizes: [],
  colors: [],
  minRating: 0,
};
