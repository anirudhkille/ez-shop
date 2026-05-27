import { ChevronLeft, ChevronRight } from "lucide-react";

import type { TProduct } from "@/types/product";

import Container from "@/layout/container";

import ProductCard from "../../features/product/product-card";
import Heading from "../ui/heading";

export default function ProductsSlider({
  heading,
  products,
}: {
  heading: string;
  products: TProduct[];
}) {
  return (
    <Container className="px-5 py-10 sm:px-8 md:px-10">
      <div className="flex items-center justify-between gap-2">
        <Heading>{heading}</Heading>
        <div className="flex gap-2">
          <button className="rounded-full bg-gray-100 p-2 transition-colors hover:bg-gray-200">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button className="rounded-full bg-gray-100 p-2 transition-colors hover:bg-gray-200">
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
      <div className="mt-5 flex gap-5 overflow-x-auto px-5 sm:gap-8 sm:px-8 md:gap-10 md:px-10">
        {products?.map((p: TProduct) => (
          <ProductCard product={p} key={p._id} />
        ))}
      </div>
    </Container>
  );
}
