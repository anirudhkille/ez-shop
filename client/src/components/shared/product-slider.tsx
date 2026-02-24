import { ChevronLeft, ChevronRight } from "lucide-react";
import ProductCard from "../product/product-card";
import Heading from "../ui/heading";
import type { TProduct } from "@/types/product";
import Container from "@/layout/container";

export default function ProductsSlider({
  heading,
  products,
}: {
  heading: string;
  products: TProduct[];
}) {
  return (
    <Container className="px-5 sm:px-8 md:px-10 py-10">
      <div className="flex items-center gap-2 justify-between">
        <Heading>{heading}</Heading>
        <div className="flex gap-2">
          <button className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
      <div className="flex px-5 sm:px-8 md:px-10 overflow-x-auto mt-5 gap-5 sm:gap-8 md:gap-10">
        {products?.map((p: TProduct) => (
          <ProductCard product={p} key={p._id} />
        ))}
      </div>
    </Container>
  );
}
