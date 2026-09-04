import type { CartItem } from "@/features/cart/cart-product-card";

import { useCart } from "@/hooks/useCart";

import Image from "../../components/ui/img";

type OrderSummaryItem = CartItem & {
  priceAtPurchase?: number;
  discountPriceAtPurchase?: number;
};

export default function OrderSummary() {
  const { data } = useCart();
  const shipping = data?.shipping || 0;

  return (
    <div className="w-full lg:w-80">
      <div className="border-border sticky top-8 rounded-lg border p-6">
        <h2 className="mb-4 text-lg font-medium">Order Summary</h2>

        {data?.products?.map((p: OrderSummaryItem) => (
          <div
            key={p?._id}
            className="border-border flex gap-3 border-b pb-4"
          >
            <div className="h-16 w-16 shrink-0 rounded-md bg-[#f5f5f5]">
              <Image
                src={p?.product?.image}
                alt={p?.product?.name}
                className="h-full w-full object-contain"
              />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-medium">{p?.product?.name}</h4>
              <p className="text-muted-foreground text-xs">
                {p?.size ? `Size ${p.size} | ` : ""}Qty: {p?.quantity}
              </p>
              <p className="mt-1 text-sm font-medium">
                ₹
                {p?.priceAtPurchase ??
                  p?.product?.discountPrice ??
                  p?.product?.price}
              </p>
            </div>
          </div>
        ))}

        <div className="space-y-3 py-4">
          <div className="flex justify-between text-sm">
            <span>Subtotal</span>
            <span>₹{data?.subtotal}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Shipping</span>
            <span>
              {shipping === 0
                ? "Free"
                : `₹${shipping.toFixed(2).replace(".", ",")}`}
            </span>
          </div>
        </div>

        <div className="border-border border-t pt-4">
          <div className="flex justify-between font-medium">
            <span>Total</span>
            <span>₹{data?.total}</span>
          </div>
        </div>
      </div>
    </div>
  );
}