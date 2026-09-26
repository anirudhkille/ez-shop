import { Link } from "react-router";

import { Banknote, Heart, ShoppingBag, Tag } from "lucide-react";

import useUserStore from "@/store/userStore";

/** Reassurance points, each backed by a real feature in the codebase. */
const perks = [
  { icon: Tag, label: "Coupon codes at checkout" },
  { icon: Banknote, label: "Cash on delivery" },
  { icon: ShoppingBag, label: "Cart saved between visits" },
];

export default function EmptyCart() {
  const { token } = useUserStore();

  return (
    <section
      role="status"
      aria-live="polite"
      className="border-brand-border bg-card flex flex-col items-center rounded-3xl border px-6 py-16 text-center sm:py-20"
    >
      <div className="bg-brand-surface-raised flex size-24 items-center justify-center rounded-full">
        <ShoppingBag size={40} className="text-muted-foreground/60" />
      </div>

      <h2 className="font-display text-foreground mt-7 text-3xl font-black tracking-wide uppercase sm:text-4xl">
        Your cart is empty
      </h2>

      <p className="font-body text-muted-foreground mt-3 max-w-sm text-sm leading-relaxed">
        Nothing here yet. Browse the latest drops and add something you love —
        your cart is saved for your next visit.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          to="/products"
          className="bg-brand-orange text-primary-foreground font-body hover:bg-brand-orange-glow inline-flex items-center gap-2 rounded-full px-8 py-3.5 text-sm font-semibold tracking-wider uppercase transition-[background-color,transform] duration-150 active:scale-[0.98]"
        >
          Start Shopping
        </Link>

        {/* Wishlist is a protected route, so only offer it when signed in. */}
        {token ? (
          <Link
            to="/account/saved"
            className="border-brand-border text-muted-foreground font-body hover:border-brand-orange/50 hover:text-foreground inline-flex items-center gap-2 rounded-full border px-8 py-3.5 text-sm font-semibold tracking-wider uppercase transition-colors duration-200"
          >
            <Heart size={15} className="fill-current" />
            View Wishlist
          </Link>
        ) : null}
      </div>

      <ul className="border-brand-border mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 border-t pt-8">
        {perks.map(({ icon: Icon, label }) => (
          <li
            key={label}
            className="font-body text-muted-foreground flex items-center gap-2 text-xs"
          >
            <Icon size={14} className="text-brand-orange shrink-0" />
            {label}
          </li>
        ))}
      </ul>
    </section>
  );
}
