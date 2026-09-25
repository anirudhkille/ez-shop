import { FC } from "react";

import { Link } from "react-router";

import { Heart } from "lucide-react";

import type { TProduct } from "@/types/product";

export interface SavedItemsProps {
  products?: TProduct[];
  isLoading?: boolean;
  limit?: number;
  showAllLink?: boolean;
}

export const SavedItems: FC<SavedItemsProps> = ({
  products = [],
  isLoading = false,
  limit = 4,
  showAllLink,
}) => {
  const items = limit ? products.slice(0, limit) : products;

  if (isLoading) {
    return Array.from({ length: limit }, (_, i) => (
      <div key={i} className="animate-pulse space-y-2">
        <div className="bg-muted-foreground/30 h-48 w-full rounded"></div>
        <div className="bg-muted-foreground/30 h-4 w-3/4 rounded"></div>
      </div>
    ));
  }

  if (!products.length) {
    return (
      <div className="py-8 text-center">
        <svg
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 10V6M8 10H16M5 20H19V8H5v12z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <p className="font-body text-muted-foreground mt-4">
          Nothing saved yet
        </p>
        <a
          href="/products"
          className="bg-brand-orange text-primary-foreground font-body mt-4 inline-block rounded-full px-6 py-3"
        >
          Browse products
        </a>
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
          <button
            onClick={() => {
              /* toggle handled by parent via hook */
            }}
            className="bg-background/80 absolute top-3 right-3 z-10 rounded-full p-1.5"
          >
            <Heart size={14} className="fill-red-500 text-red-500" />
          </button>
          <Link to={`/${p.slug}/${p._id}`}>
            <div className="bg-brand-surface-raised flex aspect-square items-center justify-center p-6">
              <img
                src={p.image}
                alt={p.name}
                className="h-full w-full object-contain transition-transform duration-200 ease-out group-hover:scale-[1.04]"
              />
            </div>
            <div className="p-4">
              <p className="font-display text-foreground truncate text-sm font-bold">
                {p.name}
              </p>
              <div className="mt-2 flex items-center justify-between">
                <span className="font-display text-brand-orange font-bold">
                  {formatPrice(p.discountPrice || p.price)}
                </span>
              </div>
            </div>
          </Link>
        </div>
      ))}
      {showAllLink && (
        <div className="col-span-full flex justify-center">
          <Link
            to="/wishlist"
            className="text-brand-orange inline-flex items-center gap-2 text-sm font-semibold"
          >
            View all
          </Link>
        </div>
      )}
    </div>
  );
};
