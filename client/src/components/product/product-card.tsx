import { Link } from "react-router";

import type { TProduct } from "@/types/product";

import Image from "../ui/img";

export default function ProductCard({ product }: { product: TProduct }) {
  return (
    <Link
      to={`/${product?.slug}`}
      className="block min-w-[180px] transition-transform hover:scale-[1.02] md:min-w-[220px]"
    >
      <div className="mx-auto h-[200px] w-[200px] overflow-hidden rounded-xl bg-gray-100">
        <Image
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover"
        />
      </div>

      <p className="mt-2 line-clamp-1 font-semibold md:text-lg">
        {product.name}
      </p>

      {product?.category?.name && (
        <p className="text-muted-foreground line-clamp-1 text-sm md:text-base">
          {product.category.name}
        </p>
      )}

      <p className="mt-3 text-sm font-semibold md:text-base">
        MRP : ₹ {product.price}
      </p>
    </Link>
  );
}
