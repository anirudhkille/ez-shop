import { Link } from "react-router";

import { ShoppingCart, Star, TrendingUp } from "lucide-react";

import Fade from "@/components/shared/fade";

import product1 from "@/assets/product-1.png";
import product2 from "@/assets/product-2.png";
import product3 from "@/assets/product-3.png";
import product4 from "@/assets/product-4.png";
import product5 from "@/assets/product-5.png";
import product6 from "@/assets/product-6.png";

const bestSellers = [
  {
    id: 1,
    name: "EZ Pro X1",
    price: 189,
    rating: 4.9,
    sold: "12.4K",
    image: product1,
  },
  {
    id: 2,
    name: "Air Phantom HT",
    price: 215,
    rating: 4.8,
    sold: "9.8K",
    image: product2,
  },
  {
    id: 3,
    name: "Velocity Low",
    price: 145,
    rating: 4.7,
    sold: "8.2K",
    image: product3,
  },
  {
    id: 4,
    name: "CloudRift X",
    price: 199,
    rating: 4.9,
    sold: "7.5K",
    image: product4,
  },
  {
    id: 5,
    name: "Noir Edition",
    price: 249,
    rating: 5.0,
    sold: "6.1K",
    image: product5,
  },
  {
    id: 6,
    name: "Heritage Runner",
    price: 135,
    rating: 4.6,
    sold: "5.9K",
    image: product6,
  },
];

export default function BestSellers() {
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
          {bestSellers.map((item, i) => (
            <Fade key={item.id} delay={i * 0.1}>
              <Link
                to={`/product/${item.id}`}
                className="group bg-card border-brand-border hover:border-brand-orange/40 flex items-center gap-4 rounded-2xl border p-4 transition-all duration-300"
                style={{ transitionDelay: `${i * 80}ms` }}
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
                    <span className="text-muted-foreground/30 text-xs">·</span>
                    <span className="font-body text-muted-foreground text-xs">
                      {item.sold} sold
                    </span>
                  </div>
                  <div className="font-display text-brand-orange mt-1 text-xl font-bold">
                    ${item.price}
                  </div>
                </div>

                <button
                  onClick={(e) => e.preventDefault()}
                  className="bg-brand-orange/10 border-brand-orange/30 text-brand-orange hover:bg-brand-orange hover:text-primary-foreground flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-all duration-200"
                >
                  <ShoppingCart size={15} />
                </button>
              </Link>{" "}
            </Fade>
          ))}
        </div>
      </div>
    </section>
  );
}
