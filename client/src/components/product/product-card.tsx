import type { TProduct } from "@/types/product";
import { Link } from "react-router";
import Image from "../ui/img";

export default function ProductCard({ product }: { product: TProduct }) {
  return (
    <Link
      to={`/${product?.slug}`}
      className="block min-w-[180px] md:min-w-[220px] transition-transform hover:scale-[1.02]"
    >
      <div className="w-[200px] h-[200px] bg-gray-100 rounded-xl overflow-hidden mx-auto">
        <Image
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover"
        />
      </div>

      <p className="font-semibold md:text-lg mt-2 line-clamp-1">
        {product.name}
      </p>

      {product?.category?.name && (
        <p className="text-muted-foreground text-sm md:text-base line-clamp-1">
          {product.category.name}
        </p>
      )}

      <p className="font-semibold mt-3 text-sm md:text-base">
        MRP : ₹ {product.price}
      </p>
    </Link>
  );
}
