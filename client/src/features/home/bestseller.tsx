import { Link } from "react-router";
import { ShoppingCart, Star, TrendingUp } from "lucide-react";
import product1 from "@/assets/product-1.png";
import product2 from "@/assets/product-2.png";
import product3 from "@/assets/product-3.png";
import product4 from "@/assets/product-4.png";
import product5 from "@/assets/product-5.png";
import product6 from "@/assets/product-6.png";

const bestSellers = [
  { id: 1, name: "EZ Pro X1", price: 189, rating: 4.9, sold: "12.4K", image: product1 },
  { id: 2, name: "Air Phantom HT", price: 215, rating: 4.8, sold: "9.8K", image: product2 },
  { id: 3, name: "Velocity Low", price: 145, rating: 4.7, sold: "8.2K", image: product3 },
  { id: 4, name: "CloudRift X", price: 199, rating: 4.9, sold: "7.5K", image: product4 },
  { id: 5, name: "Noir Edition", price: 249, rating: 5.0, sold: "6.1K", image: product5 },
  { id: 6, name: "Heritage Runner", price: 135, rating: 4.6, sold: "5.9K", image: product6 },
];

export default function BestSellers() {
  return (
    <section className="py-24 bg-background">
      <div className="max-w-350 mx-auto px-6 lg:px-10">
        {/* Header */}
        <div className="flex items-end justify-between mb-12">
          <div>
            <span className="font-body text-xs text-brand-orange uppercase tracking-widest font-semibold">Trending</span>
            <h2 className="font-display text-5xl lg:text-6xl font-black uppercase text-foreground mt-1">
              Best <span className="text-gradient-orange">Sellers</span>
            </h2>
          </div>
          <div className="hidden sm:flex items-center gap-2 bg-brand-orange/10 border border-brand-orange/30 px-4 py-2 rounded-full">
            <TrendingUp size={14} className="text-brand-orange" />
            <span className="font-body text-xs text-brand-orange font-semibold uppercase tracking-wider">This Week</span>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          {bestSellers.map((item, i) => (
            <Link
              key={item.id}
              to={`/product/${item.id}`}
              className="group flex items-center gap-4 bg-card border border-brand-border rounded-2xl p-4 hover:border-brand-orange/40 transition-all duration-300"
              style={{ transitionDelay: `${i * 80}ms` }}
            >
              {/* Rank */}
              <div className="shrink-0 w-8 text-center">
                <span className={`font-display text-2xl font-black ${i < 3 ? "text-brand-orange" : "text-muted-foreground/40"}`}>
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>

              {/* Image */}
              <div className="shrink-0 w-20 h-20 bg-brand-surface-raised rounded-xl flex items-center justify-center overflow-hidden">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-110 p-2"
                />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-display text-lg font-bold text-foreground truncate group-hover:text-brand-orange transition-colors">{item.name}</h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Star size={11} className="fill-amber-400 text-amber-400" />
                  <span className="font-body text-xs text-muted-foreground">{item.rating}</span>
                  <span className="text-muted-foreground/30 text-xs">·</span>
                  <span className="font-body text-xs text-muted-foreground">{item.sold} sold</span>
                </div>
                <div className="font-display text-xl font-bold text-brand-orange mt-1">${item.price}</div>
              </div>

              {/* Cart button */}
              <button
                onClick={(e) => e.preventDefault()}
                className="shrink-0 w-9 h-9 rounded-full bg-brand-orange/10 border border-brand-orange/30 text-brand-orange flex items-center justify-center hover:bg-brand-orange hover:text-primary-foreground transition-all duration-200"
              >
                <ShoppingCart size={15} />
              </button>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
