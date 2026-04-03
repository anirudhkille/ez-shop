import { useState } from "react";

import { Link, useParams } from "react-router";

import {
  ChevronLeft,
  ChevronRight,
  Heart,
  Minus,
  Plus,
  RotateCcw,
  Shield,
  ShoppingCart,
  Star,
  Truck,
} from "lucide-react";

import type { TProduct } from "@/types/product";

import { formatPrice } from "@/lib/formatPrice";

import { useAddToCart } from "@/hooks/useCart";
import { useProduct, useSimilarProducts } from "@/hooks/useProduct";
import { useToggleWishlist, useWishlists } from "@/hooks/useWishlist";

import { tagColors } from "@/data/products";
import ProductCard from "@/features/product/product-card";

export default function ProductDetail() {
  const { slug, id } = useParams();
  const { data: product } = useProduct(slug ?? "", id ?? "");
  const { data: related } = useSimilarProducts(id ?? "");
  const { data: wishlist } = useWishlists();
  const { mutate: toggleWishlist } = useToggleWishlist();
  const { mutate: addToCart } = useAddToCart();
  const [selectedSize, setSelectedSize] = useState<number | null>(null);
  const [selectedColorIdx, setSelectedColorIdx] = useState(0);
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const wishlistSet = new Set(wishlist?.products || []);
  const liked = wishlistSet.has(id);

  const handleWishlist = () => {
    toggleWishlist(product?._id);
  };

  
  const handleAddToCart = () => {
    if (!selectedSize) return;
    addToCart({ productId: product?._id, size: selectedSize, quantity });
  };

  if (!product) {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="font-display text-muted-foreground text-4xl uppercase">
            Product not found
          </p>
          <Link
            to="/products"
            className="font-body text-brand-orange mt-4 inline-block hover:underline"
          >
            Back to products
          </Link>
        </div>
      </div>
    );
  }

  const activeVariant = product?.variants?.[selectedColorIdx];
  const activeImages = activeVariant?.images ?? [product.image];
  const activeImage = activeImages[selectedImageIdx] ?? activeImages[0];
  const sizes = activeVariant?.sizes || [];

  const handleColorChange = (idx: number) => {
    setSelectedColorIdx(idx);
    setSelectedImageIdx(0);
  };


  return (
    <main className="pt-20">
      <div className="mx-auto grid max-w-350 grid-cols-1 gap-12 px-6 pb-20 lg:grid-cols-2 lg:gap-20 lg:px-10">
        <div className="flex flex-col gap-4">
          <div className="bg-brand-surface-raised relative flex aspect-square items-center justify-center overflow-hidden rounded-3xl p-12">
            <div className="bg-gradient-radial-dark absolute inset-0 opacity-60" />
            <div className="bg-brand-orange/8 absolute size-100 rounded-full blur-[80px]" />
            <img
              key={activeImage}
              src={activeImage}
              alt={`${product.name} – ${activeVariant?.label ?? ""}`}
              className="animate-float-subtle relative z-10 h-full w-full object-contain drop-shadow-2xl transition-opacity duration-300"
              style={{
                filter: "drop-shadow(0 20px 40px hsl(22 100% 52% / 0.2))",
              }}
            />
            <span
              className={`font-body absolute top-5 left-5 z-20 rounded-full px-3 py-1.5 text-[10px] font-bold tracking-wider uppercase ${tagColors[product.tag] ?? "bg-muted text-muted-foreground"}`}
            >
              {product.tag}
            </span>

            {activeImages.length > 1 && (
              <>
                <button
                  onClick={() =>
                    setSelectedImageIdx(
                      (selectedImageIdx - 1 + activeImages.length) %
                        activeImages.length
                    )
                  }
                  className="bg-background/80 hover:bg-brand-orange hover:text-primary-foreground absolute left-4 z-20 flex h-9 w-9 items-center justify-center rounded-full backdrop-blur transition-all"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={() =>
                    setSelectedImageIdx(
                      (selectedImageIdx + 1) % activeImages.length
                    )
                  }
                  className="bg-background/80 hover:bg-brand-orange hover:text-primary-foreground absolute right-4 z-20 flex h-9 w-9 items-center justify-center rounded-full backdrop-blur transition-all"
                >
                  <ChevronRight size={16} />
                </button>
              </>
            )}
          </div>

          {activeImages.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-1">
              {activeImages.map((img: string, i: number) => (
                <button
                  key={i}
                  onClick={() => setSelectedImageIdx(i)}
                  className={`h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2 transition-all duration-200 ${
                    selectedImageIdx === i
                      ? "border-brand-orange"
                      : "border-brand-border hover:border-brand-orange/50"
                  }`}
                >
                  <img
                    src={img}
                    alt={`View ${i + 1}`}
                    className="bg-brand-surface-raised h-full w-full object-contain p-2"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col justify-center">
          <span className="font-body text-brand-orange text-xs font-semibold tracking-widest uppercase">
            {product.category?.name}
          </span>
          <h1 className="font-display text-foreground mt-2 text-5xl leading-tight font-black uppercase lg:text-6xl">
            {product.name}
          </h1>

          <div className="mt-4 flex items-center gap-3">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={14}
                  className={
                    i < Math.floor(product.rating)
                      ? "fill-amber-400 text-amber-400"
                      : "text-muted-foreground/30"
                  }
                />
              ))}
            </div>
            <span className="font-body text-muted-foreground text-sm">
              {product.rating} ({product.reviewsCount} reviews)
            </span>
          </div>

          <div className="mt-5 flex items-baseline gap-3">
            <span className="font-display text-brand-orange text-4xl font-bold">
              {formatPrice(product.discountPrice || product.price)}
            </span>
            {product.discountPrice && (
              <span className="font-body text-muted-foreground text-lg line-through">
                {formatPrice(product.price)}
              </span>
            )}
            {product.discountPrice && (
              <span className="font-body text-sm font-semibold text-green-400">
                Save {formatPrice(product.price - product.discountPrice)}
              </span>
            )}
          </div>

          <p className="font-body text-muted-foreground mt-5 leading-relaxed">
            {product.description}
          </p>

          <div className="mt-8">
            <div className="mb-3 flex items-center justify-between">
              <span className="font-body text-foreground text-sm font-semibold">
                Color
              </span>
              <span className="font-body text-brand-orange text-xs font-medium">
                {activeVariant?.color}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {product?.variants?.map((v, i) => (
                <button
                  key={i}
                  onClick={() => handleColorChange(i)}
                  className={`h-9 w-9 rounded-full border-2 ${
                    selectedColorIdx === i
                      ? "border-brand-orange scale-110"
                      : "border-brand-border"
                  }`}
                  style={{ backgroundColor: v.colorCode }}
                />
              ))}
            </div>
          </div>

          <div className="mt-6">
            <div className="mb-3 flex items-center justify-between">
              <span className="font-body text-foreground text-sm font-semibold">
                Size (US)
              </span>
              <button className="font-body text-brand-orange text-xs hover:underline">
                Size Guide
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {sizes.map((s) => (
                <button
                  key={s.size}
                  onClick={() => setSelectedSize(Number(s.size))}
                  className={`font-body h-10 w-12 rounded-lg text-sm font-medium transition-all duration-200 ${
                    selectedSize === Number(s.size)
                      ? "bg-brand-orange text-primary-foreground"
                      : "border-brand-border text-muted-foreground hover:border-brand-orange/50 hover:text-foreground border"
                  }`}
                >
                  {s.size}
                </button>
              ))}
            </div>
            {!selectedSize && (
              <p className="font-body text-muted-foreground mt-2 text-xs">
                Please select a size
              </p>
            )}
          </div>

          <div className="mt-8 flex items-center gap-4">
            <div className="border-brand-border flex items-center overflow-hidden rounded-xl border">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="text-muted-foreground hover:text-foreground flex h-12 w-10 items-center justify-center transition-colors"
              >
                <Minus size={14} />
              </button>
              <span className="font-body text-foreground w-10 text-center font-semibold">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="text-muted-foreground hover:text-foreground flex h-12 w-10 items-center justify-center transition-colors"
              >
                <Plus size={14} />
              </button>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={!selectedSize}
              className={`font-body flex h-12 flex-1 items-center justify-center gap-2 rounded-xl text-sm font-semibold tracking-wider uppercase transition-all duration-300 ${
                selectedSize
                  ? "bg-gradient-orange text-primary-foreground btn-primary-glow hover:opacity-90"
                  : "bg-muted text-muted-foreground cursor-not-allowed"
              }`}
            >
              <ShoppingCart size={16} />
              Add to Cart
            </button>

            <button
              className={`flex h-12 w-12 items-center justify-center rounded-xl border transition-all duration-200 ${liked ? "border-red-500/40 bg-red-500/10" : "border-brand-border hover:border-brand-orange/40"}`}
              onClick={handleWishlist}
            >
              <Heart
                size={16}
                className={
                  liked ? "fill-red-500 text-red-500" : "text-muted-foreground"
                }
              />
            </button>
          </div>

          <div className="border-brand-border mt-8 grid grid-cols-3 gap-3 border-t pt-8">
            {[
              {
                icon: Truck,
                label: "Free shipping",
                sub: "Orders over ₹8,000",
              },
              {
                icon: RotateCcw,
                label: "Easy returns",
                sub: "30-day policy",
              },
              { icon: Shield, label: "Authentic", sub: "100% genuine" },
            ].map((badge) => (
              <div
                key={badge.label}
                className="flex flex-col items-center gap-2 text-center"
              >
                <badge.icon size={20} className="text-brand-orange" />
                <div>
                  <p className="font-body text-foreground text-xs font-semibold">
                    {badge.label}
                  </p>
                  <p className="font-body text-muted-foreground text-[10px]">
                    {badge.sub}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-card/40 py-20">
        <div className="mx-auto max-w-350 px-6 lg:px-10">
          <div className="mb-10">
            <span className="font-body text-brand-orange text-xs font-semibold tracking-widest uppercase">
              You may also like
            </span>
            <h2 className="font-display text-foreground mt-1 text-4xl font-black uppercase lg:text-5xl">
              Related <span className="text-gradient-orange">Products</span>
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:gap-6">
            {related?.map((p: TProduct, i: number) => (
              <ProductCard key={p._id} product={p} delay={i * 80} />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
