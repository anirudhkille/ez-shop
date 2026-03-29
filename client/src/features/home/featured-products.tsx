import { Link } from "react-router";

import type { TProduct } from "@/types/product";

import { useFeaturedProducts } from "@/hooks/useProduct";

import Fade from "@/components/shared/fade";

import ProductCard from "../product/product-card";

export default function FeaturedProducts() {
  const { data } = useFeaturedProducts();

  return (
    <section id="featured" className="bg-card/40 py-24">
      <div className="mx-auto max-w-350 px-6 lg:px-10">
        <Fade className="mb-12 flex items-end justify-between">
          <div>
            <span className="font-body text-brand-orange text-xs font-semibold tracking-widest uppercase">
              Handpicked
            </span>
            <h2 className="font-display text-foreground mt-1 text-5xl font-black uppercase lg:text-6xl">
              Featured <span className="text-gradient-orange">Products</span>
            </h2>
          </div>
          <Link
            to="/products"
            className="font-body text-muted-foreground hover:text-brand-orange group hidden items-center gap-2 text-sm font-medium transition-colors sm:inline-flex"
          >
            View All
            <span className="transition-transform duration-200 group-hover:translate-x-1">
              →
            </span>
          </Link>
        </Fade>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-6">
          {data?.map((product: TProduct, i: number) => (
            <Fade delay={i * 0.1} key={product._id}>
              <ProductCard product={product} />
            </Fade>
          ))}
        </div>
      </div>
    </section>
  );
}
