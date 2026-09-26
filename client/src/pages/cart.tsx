import { Link } from "react-router";

import { ShoppingBag } from "lucide-react";

import { formatPrice } from "@/lib/formatPrice";

import { useCouponStore } from "@/store/couponStore";

import { useCart } from "@/hooks/useCart";

import CartProductCard, {
  type CartItem,
} from "@/features/cart/cart-product-card";
import CouponField from "@/features/cart/coupon-field";

export default function Cart() {
  const { data: cartItems } = useCart();
  const couponQuote = useCouponStore((state) => state.quote);

  const subtotal = cartItems?.subtotal;
  const discount = cartItems?.discountTotal;
  const shipping = cartItems?.shipping || 0;
  const total = cartItems?.total;

  // Clamped to the current subtotal so a stale quote can never show a discount
  // larger than the cart. The server re-validates at checkout.
  const couponDiscount = Math.min(couponQuote?.discount ?? 0, subtotal ?? 0);
  const displayTotal = Math.max(0, (total ?? 0) - couponDiscount);

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
            className="bg-brand-orange text-primary-foreground font-body hover:bg-brand-orange-glow inline-flex items-center gap-2 rounded-full px-8 py-4 text-sm font-semibold tracking-wider uppercase transition-[background-color,transform] duration-150 active:scale-[0.98]"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            {cartItems?.products?.map((item: CartItem) => (
              <CartProductCard key={item?._id} item={item} />
            ))}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-card border-brand-border sticky top-24 rounded-2xl border p-6">
              <h2 className="font-display text-foreground mb-6 text-2xl font-bold uppercase">
                Order Summary
              </h2>

              {/* Coupon */}
              <CouponField subtotal={subtotal ?? 0} className="mb-6" />

              <div className="space-y-3">
                <div className="font-body flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="text-foreground">
                    {formatPrice(subtotal)}
                  </span>
                </div>
                {discount > 0 && (
                  <div className="font-body flex justify-between text-sm">
                    <span className="text-green-400">Discount</span>
                    <span className="text-green-400">
                      -{formatPrice(discount)}
                    </span>
                  </div>
                )}
                {couponDiscount > 0 && (
                  <div className="font-body flex justify-between text-sm">
                    <span className="text-green-400">
                      Coupon ({couponQuote?.code})
                    </span>
                    <span className="text-green-400">
                      -{formatPrice(couponDiscount)}
                    </span>
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
                    Add {Math.max(0, 100 - (subtotal ?? 0))} more for free
                    shipping
                  </p>
                )}
                <div className="border-brand-border flex justify-between border-t pt-3">
                  <span className="font-display text-foreground text-lg font-bold uppercase">
                    Total
                  </span>
                  <span className="font-display text-brand-orange text-2xl font-bold">
                    {formatPrice(displayTotal)}
                  </span>
                </div>
              </div>

              <Link
                to="/checkout"
                className="bg-brand-orange text-primary-foreground font-body hover:bg-brand-orange-glow mt-6 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold tracking-wider uppercase transition-[background-color,transform] duration-150 active:scale-[0.98]"
              >
                Checkout
              </Link>

              <Link
                to="/products"
                className="border-brand-border text-muted-foreground font-body hover:border-brand-orange/50 hover:text-foreground mt-3 flex w-full items-center justify-center gap-2 rounded-xl border py-3 text-sm tracking-wider uppercase transition-colors duration-200"
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
