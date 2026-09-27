import { Link } from "react-router";

import { ArrowRight, ShoppingCart } from "lucide-react";

type Props = {
  /** Guests cannot add to a server cart, so the copy nudges them to the shop. */
  showBackToCart?: boolean;
};

export function CheckoutEmpty({ showBackToCart = false }: Props) {
  return (
    <div className="bg-card border-brand-border rounded-4xl border p-8 text-center lg:p-14">
      <div className="bg-brand-orange/10 mx-auto flex size-18 items-center justify-center rounded-full">
        <ShoppingCart className="text-brand-orange h-9 w-9" />
      </div>
      <h2 className="font-display text-foreground mt-6 text-3xl font-black uppercase">
        Your cart is empty
      </h2>
      <p className="font-body text-muted-foreground mx-auto mt-3 max-w-lg text-sm leading-6">
        {showBackToCart
          ? "Add a few products to your cart before starting checkout."
          : "Add products to your cart first, then come back to checkout."}
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          to="/products"
          className="bg-brand-orange text-primary-foreground font-body hover:bg-brand-orange-glow inline-flex items-center gap-2 rounded-xl px-7 py-4 text-sm font-semibold tracking-wider uppercase transition-[background-color,transform] duration-150 active:scale-[0.98]"
        >
          Browse Products <ArrowRight size={16} />
        </Link>
        {showBackToCart && (
          <Link
            to="/cart"
            className="border-brand-border text-muted-foreground font-body hover:border-brand-orange/40 hover:text-foreground inline-flex items-center gap-2 rounded-xl border px-7 py-4 text-sm tracking-wider uppercase transition-colors duration-150"
          >
            Back to Cart
          </Link>
        )}
      </div>
    </div>
  );
}
