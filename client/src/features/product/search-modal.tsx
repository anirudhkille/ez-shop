import { useEffect, useRef, useState } from "react";

import { Link } from "react-router";

import { ArrowRight, Loader2, Search, Star, Tag, X } from "lucide-react";

import type { TProduct } from "@/types/product";

import { formatPrice } from "@/lib/formatPrice";

import { useSearchProducts } from "@/hooks/useProduct";

interface SearchModalProps {
  open: boolean;
  onClose: () => void;
}

export default function SearchModal({ open, onClose }: SearchModalProps) {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: products, isLoading } = useSearchProducts(debouncedQuery);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 80);
      setQuery("");
      setDebouncedQuery("");
    }
  }, [open]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 250);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const displayProducts = products ?? [];

  const hasQuery = debouncedQuery.length > 0;

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-100 flex h-dvh flex-col"
      style={{ background: "hsl(var(--background) / 0.97)" }}
    >
      <div className="absolute inset-0 backdrop-blur-xl" />

      <div className="relative z-10 mx-auto flex h-full w-full max-w-4xl flex-col px-5 sm:px-10">
        <div className="border-brand-border flex items-center gap-4 border-b pt-6 pb-5">
          <Search size={22} className="text-brand-orange shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search sneakers, categories…"
            className="font-display text-foreground placeholder:text-muted-foreground/40 flex-1 bg-transparent text-2xl font-bold tracking-wide outline-none sm:text-3xl"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X size={18} />
            </button>
          )}
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground font-body flex shrink-0 items-center gap-1.5 text-sm font-medium transition-colors"
          >
            <span className="hidden sm:inline">Close</span>
            <kbd className="border-brand-border bg-muted text-muted-foreground hidden h-5 w-8 items-center justify-center rounded border text-[10px] font-semibold tracking-wider sm:inline-flex">
              ESC
            </kbd>
            <X size={18} className="sm:hidden" />
          </button>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto py-6">
          <p className="font-body text-muted-foreground/60 mb-5 text-xs tracking-widest uppercase">
            {hasQuery
              ? `${displayProducts.length} result${displayProducts.length !== 1 ? "s" : ""} for "${debouncedQuery}"`
              : `All products`}
          </p>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2
                size={32}
                className="text-muted-foreground/40 animate-spin"
              />
            </div>
          ) : displayProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-4 py-20">
              <Search size={40} className="text-muted-foreground/20" />
              <p className="font-display text-muted-foreground/30 text-2xl font-bold tracking-wider uppercase">
                No results found
              </p>
              <p className="font-body text-muted-foreground/40 text-sm">
                Try a different keyword or browse all products
              </p>
              <Link
                to="/products"
                onClick={onClose}
                className="font-body text-brand-orange hover:text-brand-orange/80 mt-2 flex items-center gap-2 text-sm font-semibold transition-colors"
              >
                Browse all products <ArrowRight size={14} />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {displayProducts.map((product: TProduct) => (
                <Link
                  key={product._id}
                  to={`/${product.slug}/${product._id}`}
                  onClick={onClose}
                  className="group border-brand-border hover:border-brand-orange/40 bg-card hover:bg-card/80 flex items-center gap-4 rounded-2xl border p-3 transition-all duration-200"
                >
                  <div className="bg-muted/20 flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl sm:h-20 sm:w-20">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-110"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-start justify-between gap-2">
                      <h3 className="font-display text-foreground group-hover:text-brand-orange truncate text-sm font-bold transition-colors">
                        {product.name}
                      </h3>
                      {product.tag && (
                        <span className="bg-brand-orange text-primary-foreground shrink-0 rounded px-1.5 py-0.5 text-[9px] font-bold tracking-wider uppercase">
                          {product.tag}
                        </span>
                      )}
                    </div>
                    <p className="font-body text-muted-foreground mb-2 flex items-center gap-1 text-xs">
                      <Tag size={10} />
                      {typeof product.category === "string"
                        ? product.category
                        : (product.category?.name ?? "")}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <span className="font-display text-foreground text-sm font-bold">
                          {formatPrice(product.discountPrice || product.price)}
                        </span>
                        {product.discountPrice && (
                          <span className="font-body text-muted-foreground/50 text-xs line-through">
                            {formatPrice(product.price)}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-amber-400">
                        <Star size={10} fill="currentColor" />
                        <span className="font-body text-muted-foreground text-xs">
                          {product.rating ?? 0}
                        </span>
                      </div>
                    </div>
                  </div>

                  <ArrowRight
                    size={14}
                    className="text-muted-foreground/30 group-hover:text-brand-orange shrink-0 transition-all duration-200 group-hover:translate-x-1"
                  />
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="border-brand-border/40 flex shrink-0 items-center justify-between border-t py-4">
          <p className="font-body text-muted-foreground/40 text-xs">
            Press{" "}
            <kbd className="text-muted-foreground/60 font-semibold">↵</kbd> to
            view first result
          </p>
          <Link
            to="/products"
            onClick={onClose}
            className="font-body text-muted-foreground hover:text-brand-orange flex items-center gap-1 text-xs font-semibold transition-colors"
          >
            View all products <ArrowRight size={11} />
          </Link>
        </div>
      </div>
    </div>
  );
}
