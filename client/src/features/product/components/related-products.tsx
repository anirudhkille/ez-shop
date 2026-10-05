import type { TProduct } from "@/features/product";

import { ProductCard } from "./product-card";

export function RelatedProducts({ products }: { products: TProduct[] }) {
  if (products.length === 0) return null;

  return (
    <div className="bg-card/40 py-20 pb-32 lg:pb-20">
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
          {products.map((p: TProduct, i: number) => (
            <ProductCard key={p._id} product={p} delay={i * 80} />
          ))}
        </div>
      </div>
    </div>
  );
}
