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

export const toggleInList = <T>(list: T[], value: T): T[] =>
  list.includes(value)
    ? list.filter((item) => item !== value)
    : [...list, value];
