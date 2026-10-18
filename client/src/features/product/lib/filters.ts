import { PRICE_MAX, PRICE_MIN, PRICE_STEP } from "./constants";

export interface FilterState {
  categories: string[];
  priceRange: [number, number];
  sizes: string[];
  colors: string[];
  minRating: number;
}

export const defaultFilters: FilterState = {
  categories: [],
  priceRange: [PRICE_MIN, PRICE_MAX],
  sizes: [],
  colors: [],
  minRating: 0,
};

export const toggleInList = <T>(list: T[], value: T): T[] =>
  list.includes(value)
    ? list.filter((item) => item !== value)
    : [...list, value];

export const priceCeiling = (max?: number): [number, number] => {
  if (!max || max <= 0) return [PRICE_MIN, PRICE_MAX];

  return [
    PRICE_MIN,
    Math.max(PRICE_STEP, Math.ceil(max / PRICE_STEP) * PRICE_STEP),
  ];
};

export const isPriceNarrowed = (filters: FilterState, max: number) =>
  filters.priceRange[0] > PRICE_MIN || filters.priceRange[1] < max;

export const countActiveFilters = (filters: FilterState, max: number) =>
  filters.categories.length +
  filters.sizes.length +
  filters.colors.length +
  (filters.minRating > 0 ? 1 : 0) +
  (isPriceNarrowed(filters, max) ? 1 : 0);
