import { useSearchParams } from "react-router";

import type { TProduct } from "@/types/product";

import { useCart } from "@/hooks/useCart";

import Image from "../../components/ui/img";

export default function OrderSummary() {
  const [q] = useSearchParams();
  const { data } = useCart();
  const shippingMethod = q.get("shippingMethod");
  const shipping = shippingMethod === "express" ? 200 : 0;

  return (
    <div className="w-full lg:w-80">
      <div className="border-border sticky top-8 rounded-lg border p-6">
        <h2 className="mb-4 text-lg font-medium">Order Summary</h2>

        {data?.data?.products?.map((p: { product: TProduct }) => (
          <div className="border-border flex gap-3 border-b pb-4">
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
                Size 38.5 | Qty: 2
              </p>
              <p className="mt-1 text-sm font-medium">
                ₹{p?.product?.discountPrice}
              </p>
            </div>
          </div>
        ))}

        <div className="space-y-3 py-4">
          <div className="flex justify-between text-sm">
            <span>Subtotal</span>
            <span>₹{data?.data?.subtotal}</span>
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
            <span>₹{data?.data?.total}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
