import { useState } from "react";

import { Link } from "react-router";

import { ArrowRight, ShoppingBag, Tag } from "lucide-react";

import type { TProduct } from "@/types/product";

import { useCart } from "@/hooks/useCart";

import CartProductCard from "@/features/cart/cart-product-card";

export default function Cart() {
  const { data: cartItems } = useCart();
  const [coupon, setCoupon] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);

  const subtotal = cartItems?.subtotal;
  const discount = cartItems?.discountTotal;
  const shipping = cartItems?.shipping || 0;
  const total = cartItems?.total;

  return (
    <div className="mx-auto max-w-350 px-6 pt-20 pb-10 lg:px-10">
      <div className="mb-10">
        <span className="font-body text-brand-orange text-xs font-semibold tracking-widest uppercase">
          Your
        </span>
        <h1 className="font-display text-foreground mt-1 text-5xl font-black uppercase lg:text-6xl">
          Shopping <span className="text-gradient-orange">Cart</span>
        </h1>
      </div>

      {cartItems?.products?.length === 0 ? (
        <div className="flex flex-col items-center gap-6 py-32 text-center">
          <ShoppingBag size={64} className="text-muted-foreground/20" />
          <p className="font-display text-muted-foreground text-3xl uppercase">
            Your cart is empty
          </p>
          <Link
            to="/products"
            className="bg-gradient-orange text-primary-foreground font-body inline-flex items-center gap-2 rounded-full px-8 py-4 text-sm font-semibold tracking-wider uppercase transition-opacity hover:opacity-90"
          >
            Start Shopping <ArrowRight size={16} />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            {cartItems?.products?.map((item: TProduct) => (
              <CartProductCard key={item?._id} item={item} />
            ))}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-card border-brand-border sticky top-24 rounded-2xl border p-6">
              <h2 className="font-display text-foreground mb-6 text-2xl font-bold uppercase">
                Order Summary
              </h2>

              {/* Coupon */}
              <div className="mb-6 flex gap-2">
                <div className="relative flex-1">
                  <Tag
                    size={14}
                    className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2"
                  />
                  <input
                    value={coupon}
                    onChange={(e) => setCoupon(e.target.value)}
                    placeholder="Promo code"
                    className="bg-background border-brand-border font-body text-foreground placeholder:text-muted-foreground focus:border-brand-orange w-full rounded-xl border py-2.5 pr-4 pl-9 text-sm transition-colors focus:outline-none"
                  />
                </div>
                <button
                  onClick={() => {
                    if (coupon) setCouponApplied(true);
                  }}
                  className="bg-brand-orange/10 border-brand-orange/30 text-brand-orange font-body hover:bg-brand-orange hover:text-primary-foreground rounded-xl border px-4 py-2.5 text-sm font-semibold transition-all duration-200"
                >
                  Apply
                </button>
              </div>
              {couponApplied && (
                <p className="font-body mb-4 text-xs text-green-400">
                  ✓ 10% discount applied!
                </p>
              )}

              <div className="space-y-3">
                <div className="font-body flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="text-foreground">{subtotal}</span>
                </div>
                {discount > 0 && (
                  <div className="font-body flex justify-between text-sm">
                    <span className="text-green-400">Discount</span>
                    <span className="text-green-400">-{discount}</span>
                  </div>
                )}
                <div className="font-body flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span
                    className={
                      shipping === 0 ? "text-green-400" : "text-foreground"
                    }
                  >
                    {shipping === 0 ? "Free" : shipping}
                  </span>
                </div>
                {shipping > 0 && (
                  <p className="font-body text-muted-foreground text-xs">
                    Add {100 - subtotal} more for free shipping
                  </p>
                )}
                <div className="border-brand-border flex justify-between border-t pt-3">
                  <span className="font-display text-foreground text-lg font-bold uppercase">
                    Total
                  </span>
                  <span className="font-display text-brand-orange text-2xl font-bold">
                    {total}
                  </span>
                </div>
              </div>

              <Link
                to="/checkout"
                className="bg-gradient-orange text-primary-foreground font-body btn-primary-glow mt-6 flex w-full items-center justify-center gap-2 rounded-xl py-4 text-sm font-semibold tracking-wider uppercase transition-all duration-300 hover:opacity-90"
              >
                Checkout <ArrowRight size={16} />
              </Link>

              <Link
                to="/products"
                className="border-brand-border text-muted-foreground font-body hover:border-brand-orange/50 hover:text-foreground mt-3 flex w-full items-center justify-center gap-2 rounded-xl border py-3 text-sm tracking-wider uppercase transition-all duration-200"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
