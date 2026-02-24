import type { TCategory } from "./category";

export type TVariant = {
  color: string;
  colorCode: string;
  images: string[];
  sizes: {
    size: string;
    stock: number;
    sku: string;
    price: number;
    discountPrice: number;
  }[];
};

export type TProduct = {
  _id: string;
  name: string;
  slug: string;
  description: string;
  category: TCategory;
  price: number;
  discountPrice: number;
  image: string;
  variants: TVariant[];
  stock: number;
  isFeatured: boolean;
  isNewArrival: boolean;
  publish: boolean;
};
