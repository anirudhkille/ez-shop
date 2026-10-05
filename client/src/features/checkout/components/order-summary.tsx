import { Link } from "react-router";

import { TicketPercent } from "lucide-react";

import type { TAddress } from "@/features/account";
import { CouponField } from "@/features/coupon";
import { formatPrice } from "@/shared/lib/format-price";

import {
  categoryLabelFor,
  type CheckoutCartItem,
  type GuestDetails,
  unitPriceFor,
} from "../types";
import { ShippingTarget } from "./step-delivery";

type Props = {
  items: CheckoutCartItem[];
  subtotal: number;
  discount: number;
  couponDiscount: number;
  couponCode?: string;
  deliveryCharge: number;
  total: number;
  isSignedIn: boolean;
  selectedAddress?: TAddress;
  guest: GuestDetails;
};

export function OrderSummary({
  items,
  subtotal,
  discount,
  couponDiscount,
  couponCode,
  deliveryCharge,
  total,
  isSignedIn,
  selectedAddress,
  guest,
}: Props) {
  return (
    <aside>
      <div className="bg-card border-brand-border sticky top-24 rounded-[1.75rem] border p-6 lg:p-8">
        <div className="mb-6">
          <p className="font-body text-brand-orange text-xs font-semibold tracking-[0.24em] uppercase">
            Order Review
          </p>
          <h2 className="font-display text-foreground mt-1 text-3xl font-black uppercase">
            Summary
          </h2>
        </div>

        <div className="space-y-4">
          {items.map((item) => {
            const category = categoryLabelFor(item);

            return (
              <div
                key={item._id}
                className="border-brand-border flex gap-4 border-b pb-4 last:border-b-0 last:pb-0"
              >
                <Link
                  to={`/${item.product.slug}/${item.product._id}`}
                  className="bg-brand-surface-raised flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl"
                >
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="h-full w-full object-contain p-2"
                  />
                </Link>
                <div className="min-w-0 flex-1">
                  {category && (
                    <p className="font-body text-muted-foreground text-[10px] tracking-[0.24em] uppercase">
                      {category}
                    </p>
                  )}
                  <p className="font-body text-foreground mt-1 text-sm font-semibold">
                    {item.product.name}
                  </p>
                  <p className="font-body text-muted-foreground mt-2 text-xs">
                    Qty {item.quantity}
                    {item.size ? ` · Size ${item.size}` : ""}
                  </p>
                </div>
                <div className="font-display text-brand-orange text-lg font-black">
                  {formatPrice(unitPriceFor(item) * item.quantity)}
                </div>
              </div>
            );
          })}
        </div>

        <div className="border-brand-border mt-6 border-t pt-5">
          <p className="font-body text-muted-foreground mb-3 flex items-center gap-2 text-sm font-medium">
            <TicketPercent className="h-4 w-4" />
            Coupon
          </p>
          <CouponField subtotal={subtotal} />
        </div>

        <div className="border-brand-border mt-6 space-y-3 border-t pt-5">
          <div className="font-body flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="text-foreground">{formatPrice(subtotal)}</span>
          </div>
          {discount > 0 && (
            <div className="font-body flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Discount</span>
              <span className="text-green-500">-{formatPrice(discount)}</span>
            </div>
          )}
          {couponDiscount > 0 && (
            <div className="font-body flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                Coupon ({couponCode})
              </span>
              <span className="text-green-500">
                -{formatPrice(couponDiscount)}
              </span>
            </div>
          )}
          <div className="font-body flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Delivery</span>
            <span className="text-foreground">
              {deliveryCharge === 0 ? "Free" : formatPrice(deliveryCharge)}
            </span>
          </div>
          <div className="border-brand-border flex items-center justify-between border-t pt-4">
            <span className="font-display text-foreground text-lg font-black uppercase">
              Total
            </span>
            <span className="font-display text-brand-orange text-3xl font-black">
              {formatPrice(total)}
            </span>
          </div>
        </div>

        <div className="mt-6">
          <ShippingTarget
            isSignedIn={isSignedIn}
            selectedAddress={selectedAddress}
            guest={guest}
            heading="Shipping To"
          />
        </div>
      </div>
    </aside>
  );
}
