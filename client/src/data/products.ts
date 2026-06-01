

export interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  originalPrice: number | null;
  rating: number;
  reviews: number;
  image: string;
  tag: string;
  colors: string[];
  sizes: number[];
  description: string;
}

export const tagColors: Record<string, string> = {
  New: "bg-brand-orange text-primary-foreground",
  Hot: "bg-red-500 text-primary-foreground",
  Sale: "bg-green-500 text-primary-foreground",
  Limited: "bg-amber-500 text-primary-foreground",
  "Best Seller": "bg-brand-orange text-primary-foreground",
};
