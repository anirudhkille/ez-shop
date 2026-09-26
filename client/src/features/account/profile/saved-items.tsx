import type { FC } from "react";

import { Link } from "react-router";

import { Heart } from "lucide-react";

import type { TProduct } from "@/types/product";

import { formatPrice } from "@/lib/formatPrice";

export interface SavedItemsProps {
  products?: TProduct[];
  isLoading?: boolean;
  /** 0 shows every item. */
  limit?: number;
  /** Called with the product id; the parent owns the wishlist mutation. */
  onRemove?: (productId: string) => void;
}

export const SavedItems: FC<SavedItemsProps> = ({
  products = [],
  isLoading = false,
  limit = 4,
  onRemove,
}) => {
  const items = limit ? products.slice(0, limit) : products;

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4" aria-busy>
        {Array.from({ length: limit }, (_, i) => (
          <div
            key={i}
            className="bg-card border-brand-border animate-pulse rounded-2xl border p-4"
          >
            <div className="bg-muted-foreground/25 mb-3 aspect-square w-full rounded" />
            <div className="bg-muted-foreground/25 h-4 w-3/4 rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (!products.length) {
    return (
      <div className="py-14 text-center">
        <Heart
          size={40}
          className="text-muted-foreground/30 mx-auto mb-3"
          aria-hidden
        />
        <p className="font-body text-muted-foreground text-sm">
          Your wishlist is empty
        </p>
        <Link
          to="/products"
          className="bg-brand-orange text-primary-foreground font-body mt-5 inline-block rounded-full px-6 py-3 text-sm font-semibold"
        >
          Browse products
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {items.map((p: TProduct) => (
        <div
          key={p._id}
          className="group bg-card border-brand-border hover:border-brand-orange/40 relative overflow-hidden rounded-2xl border transition-[border-color,transform] duration-200 hover:-translate-y-1"
        >
          {onRemove ? (
            <button
              type="button"
              onClick={() => onRemove(p._id)}
              aria-label={`Remove ${p.name} from wishlist`}
              className="bg-background/80 absolute top-3 right-3 z-10 rounded-full p-1.5"
            >
              <Heart size={14} className="fill-red-500 text-red-500" />
            </button>
          ) : null}

          <Link to={`/${p.slug}/${p._id}`}>
            <div className="bg-brand-surface-raised flex aspect-square items-center justify-center p-6">
              <img
                src={p.image}
                alt={p.name}
                loading="lazy"
                className="h-full w-full object-contain transition-transform duration-200 ease-out group-hover:scale-[1.04]"
              />
            </div>
            <div className="p-4">
              <p className="font-display text-foreground truncate text-sm font-bold">
                {p.name}
              </p>
              <p className="font-display text-brand-orange mt-2 font-bold">
                {formatPrice(p.discountPrice || p.price)}
              </p>
            </div>
          </Link>
        </div>
      ))}
    </div>
  );
};
