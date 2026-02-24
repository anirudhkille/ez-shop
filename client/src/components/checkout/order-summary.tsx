import { useCart } from "@/hooks/useCart";
import { useSearchParams } from "react-router";
import Image from "../ui/img";
import type { TProduct } from "@/types/product";

export default function OrderSummary() {
  const [q] = useSearchParams();
  const { data } = useCart();
  const shippingMethod = q.get("shippingMethod");
  const shipping = shippingMethod === "express" ? 200 : 0;

  return (
    <div className="w-full lg:w-80">
      <div className="border border-border rounded-lg p-6 sticky top-8">
        <h2 className="text-lg font-medium mb-4">Order Summary</h2>

        {data?.data?.products?.map((p: { product: TProduct }) => (
          <div className="flex gap-3 pb-4 border-b border-border">
            <div className="w-16 h-16 bg-[#f5f5f5] rounded-md shrink-0">
              <Image
                src={p?.product?.image}
                alt={p?.product?.name}
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-sm">{p?.product?.name}</h4>
              <p className="text-xs text-muted-foreground">
                Size 38.5 | Qty: 2
              </p>
              <p className="text-sm font-medium mt-1">
                ₹{p?.product?.discountPrice}
              </p>
            </div>
          </div>
        ))}

        <div className="py-4 space-y-3">
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

        <div className="border-t border-border pt-4">
          <div className="flex justify-between font-medium">
            <span>Total</span>
            <span>₹{data?.data?.total}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
