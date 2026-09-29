import { formatPrice } from "@/shared/lib/formatPrice";
import type { TProduct } from "@/shared/types/product";

export default function ProductPrice({ product }: { product: TProduct }) {
  const onSale = product.discountPrice > 0;

  return (
    <div className="mt-5 flex items-baseline gap-3">
      <span className="font-display text-brand-orange text-4xl font-bold">
        {formatPrice(product.discountPrice || product.price)}
      </span>
      {onSale && (
        <span className="font-body text-muted-foreground text-lg line-through">
          {formatPrice(product.price)}
        </span>
      )}
      {onSale && (
        <span className="font-body text-sm font-semibold text-green-400">
          Save {formatPrice(product.price - product.discountPrice)}
        </span>
      )}
    </div>
  );
}
