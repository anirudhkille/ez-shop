import { Link } from "react-router";

import { toast } from "sonner";

import { Heart, Star } from "lucide-react";

import type { TProduct } from "@/types/product";

import { formatPrice } from "@/lib/formatPrice";

import useUserStore from "@/store/userStore";

import { useToggleWishlist, useWishlists } from "@/hooks/useWishlist";

import { tagColors } from "@/data/products";

interface ProductCardProps {
  product: TProduct;
  delay?: number;
  className?: string;
}

export default function ProductCard({
  product,
  className = "",
}: ProductCardProps) {
  const { token } = useUserStore();
  const { data: wishlist } = useWishlists();
  const { mutate } = useToggleWishlist();

  const wishlistSet = new Set(wishlist?.products || []);
  const liked = wishlistSet.has(product._id);

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!token) {
      toast.error("Login to save wishlist");
      return;
    }
    mutate(product?._id);
  };

  return (
    <Link
      to={`/${product?.slug}/${product?._id}`}
      className={`group bg-card border-brand-border card-hover block overflow-hidden rounded-2xl border ${className}`}
    >
      <div className="bg-brand-surface-raised relative aspect-square overflow-hidden p-6">
        <span
          className={`font-body absolute top-3 left-3 z-10 rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase ${tagColors[product?.tag]}`}
        >
          {product?.tag}
        </span>
        <button
          onClick={handleWishlist}
          className="bg-background/80 absolute top-3 right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full backdrop-blur transition-all duration-200 hover:scale-110"
        >
          <Heart
            size={15}
            className={
              liked ? "fill-red-500 text-red-500" : "text-muted-foreground"
            }
          />
        </button>
        <img
          src={product?.image}
          alt={product?.name}
          className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute bottom-3 left-3 flex gap-1.5">
          {product?.variants?.map((v, i) => (
            <div
              key={i}
              className="border-brand-border/60 h-3 w-3 rounded-full border"
              style={{ backgroundColor: v.colorCode }}
            />
          ))}
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <span className="font-body text-muted-foreground text-[11px] tracking-widest uppercase">
              {product?.category?.name}
            </span>
            <h3 className="font-display text-foreground mt-0.5 text-lg leading-tight font-bold">
              {product?.name}
            </h3>
          </div>
          <div className="shrink-0 text-right">
            <div className="font-display text-brand-orange text-xl font-bold">
              {formatPrice(product?.discountPrice || product?.price)}
            </div>
            {product?.discountPrice && (
              <div className="font-body text-muted-foreground text-xs line-through">
                {formatPrice(product?.price)}
              </div>
            )}
          </div>
        </div>

        <div className="mt-2 flex items-center gap-1.5">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={11}
                className={
                  i < Math.floor(product?.rating)
                    ? "fill-amber-400 text-amber-400"
                    : "text-muted-foreground/30"
                }
              />
            ))}
          </div>
          <span className="font-body text-muted-foreground text-xs">
            {product?.rating} ({product?.reviewsCount})
          </span>
        </div>
      </div>
    </Link>
  );
}
