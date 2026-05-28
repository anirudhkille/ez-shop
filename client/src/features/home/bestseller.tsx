import { Link } from "react-router";

import { Star, TrendingUp } from "lucide-react";

import type { TProduct } from "@/types/product";

import { formatPrice } from "@/lib/formatPrice";

import { useBestSellers } from "@/hooks/useProduct";

import Fade from "@/components/shared/fade";

export default function BestSellers() {
  const { data: bestSellers } = useBestSellers();
  return (
    <section className="bg-background py-24">
      <div className="mx-auto max-w-350 px-6 lg:px-10">
        <Fade className="mb-12 flex items-end justify-between">
          <div>
            <span className="font-body text-brand-orange text-xs font-semibold tracking-widest uppercase">
              Trending
            </span>
            <h2 className="font-display text-foreground mt-1 text-5xl font-black uppercase lg:text-6xl">
              Best <span className="text-gradient-orange">Sellers</span>
            </h2>
          </div>
          <div className="bg-brand-orange/10 border-brand-orange/30 hidden items-center gap-2 rounded-full border px-4 py-2 sm:flex">
            <TrendingUp size={14} className="text-brand-orange" />
            <span className="font-body text-brand-orange text-xs font-semibold tracking-wider uppercase">
              This Week
            </span>
          </div>
        </Fade>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {bestSellers?.map((item: TProduct, i: number) => (
            <Fade key={item._id} delay={i * 0.1}>
              <Link
                to={`/${item.slug}/${item._id}`}
                className="group bg-card border-brand-border hover:border-brand-orange/40 flex items-center gap-4 rounded-2xl border p-4 transition-all duration-300"
              >
                <div className="w-8 shrink-0 text-center">
                  <span
                    className={`font-display text-2xl font-black ${i < 3 ? "text-brand-orange" : "text-muted-foreground/40"}`}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>

                <div className="bg-brand-surface-raised flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-full w-full object-contain p-2 transition-transform duration-300 group-hover:scale-110"
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="font-display text-foreground group-hover:text-brand-orange truncate text-lg font-bold transition-colors">
                    {item.name}
                  </h3>
                  <div className="mt-0.5 flex items-center gap-1.5">
                    <Star size={11} className="fill-amber-400 text-amber-400" />
                    <span className="font-body text-muted-foreground text-xs">
                      {item.rating}
                    </span>
                  </div>
                  <div className="font-display text-brand-orange mt-1 text-xl font-bold">
                    {formatPrice(item.price)}
                  </div>
                </div>
              </Link>
            </Fade>
          ))}
        </div>
      </div>
    </section>
  );
}
