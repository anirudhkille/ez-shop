import { useState } from "react";

import { Link } from "react-router";

import { Heart, ShoppingCart, Star } from "lucide-react";

import { type Product, tagColors } from "@/data/products";

interface ProductCardProps {
  product: Product;
  delay?: number;
  className?: string;
}

export default function ProductCard({
  product,
  className = "",
}: ProductCardProps) {
  const [liked, setLiked] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 1500);
  };

  return (
    <Link
      to={`/product/${product.id}`}
      className={`group bg-card border-brand-border card-hover block overflow-hidden rounded-2xl border ${className}`}
    >
      {/* Image container */}
      <div className="bg-brand-surface-raised relative aspect-square overflow-hidden p-6">
        <span
          className={`font-body absolute top-3 left-3 z-10 rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase ${tagColors[product.tag]}`}
        >
          {product.tag}
        </span>
        <button
          onClick={(e) => {
            e.preventDefault();
            setLiked(!liked);
          }}
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
          src={product.image}
          alt={product.name}
          className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute bottom-3 left-3 flex gap-1.5">
          {product.colors.map((c, i) => (
            <div
              key={i}
              className="border-brand-border/60 h-3 w-3 rounded-full border"
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <span className="font-body text-muted-foreground text-[11px] tracking-widest uppercase">
              {product.category}
            </span>
            <h3 className="font-display text-foreground mt-0.5 text-lg leading-tight font-bold">
              {product.name}
            </h3>
          </div>
          <div className="shrink-0 text-right">
            <div className="font-display text-brand-orange text-xl font-bold">
              {product.price}
            </div>
            {product.originalPrice && (
              <div className="font-body text-muted-foreground text-xs line-through">
                {product.originalPrice}
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
                  i < Math.floor(product.rating)
                    ? "fill-amber-400 text-amber-400"
                    : "text-muted-foreground/30"
                }
              />
            ))}
          </div>
          <span className="font-body text-muted-foreground text-xs">
            {product.rating} ({product.reviews})
          </span>
        </div>

        <button
          onClick={handleAddToCart}
          className={`font-body mt-4 flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold tracking-wider uppercase transition-all duration-300 ${
            addedToCart
              ? "border border-green-500/30 bg-green-500/20 text-green-400"
              : "bg-brand-orange/10 border-brand-orange/30 text-brand-orange hover:bg-brand-orange hover:text-primary-foreground hover:border-brand-orange border"
          }`}
        >
          <ShoppingCart size={15} />
          {addedToCart ? "Added!" : "Add to Cart"}
        </button>
      </div>
    </Link>
  );
}
