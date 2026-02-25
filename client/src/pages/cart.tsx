import { Link } from "react-router";

import { Heart, Minus, Plus } from "lucide-react";

import { useCart, useUpdateCartQty } from "@/hooks/useCart";

import Container from "@/layout/container";

import { Button } from "@/components/ui/button";
import Image from "@/components/ui/img";

export default function Cart() {
  const { data } = useCart();
  const { mutate: updateQty } = useUpdateCartQty();

  const cart = data?.data;

  if (!cart) return null;

  return (
    <Container className="px-5 py-10 sm:px-10 md:px-10">
      <h1 className="mb-6 text-2xl font-medium">Cart</h1>

      <div className="flex flex-col gap-8 lg:flex-row">
        <div className="flex-1">
          {cart.products.map((c: any) => (
            <div key={c._id}>
              <div className="flex gap-4">
                <div className="h-40 w-40 shrink-0 rounded-md bg-[#f5f5f5]">
                  <Image
                    src={c.product.image}
                    alt={c.product.name}
                    className="h-full w-full object-contain"
                  />
                </div>

                <div className="flex-1">
                  <div className="flex justify-between">
                    <div>
                      <h3 className="text-base font-medium">
                        {c.product.name}
                      </h3>

                      <p className="text-muted-foreground mt-1 text-sm">
                        Size: {c.size || "Free Size"}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-muted-foreground mr-2 text-sm line-through">
                        ₹{c.priceAtPurchase}
                      </span>
                      <span className="font-medium">
                        ₹{c.discountPriceAtPurchase}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex items-center gap-4">
                <div className="border-border flex items-center rounded-full border">
                  <button
                    onClick={() =>
                      updateQty({
                        cartItemId: c._id,
                        quantity: Math.max(1, c.quantity - 1),
                      })
                    }
                    className="hover:bg-muted rounded-l-full p-3 transition-colors"
                  >
                    <Minus className="h-4 w-4" />
                  </button>

                  <span className="min-w-10 px-4 text-center">
                    {c.quantity}
                  </span>

                  <button
                    onClick={() =>
                      updateQty({
                        cartItemId: c._id,
                        quantity: c.quantity + 1,
                      })
                    }
                    className="hover:bg-muted rounded-r-full p-3 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                <button className="border-border hover:bg-muted rounded-full border p-3 transition-colors">
                  <Heart className="h-5 w-5" />
                </button>
              </div>

              <div className="border-border mt-8 border-t" />
            </div>
          ))}
        </div>

        <div className="w-full lg:w-80">
          <h2 className="mb-6 text-xl font-medium">Summary</h2>

          <div className="flex justify-between py-3">
            <span>Subtotal</span>
            <span>₹{cart.subtotal}</span>
          </div>

          <div className="flex justify-between py-3">
            <span>Discount</span>
            <span>₹{cart.discountTotal}</span>
          </div>

          <div className="flex justify-between py-3">
            <span>Estimated Delivery</span>
            <span>Free</span>
          </div>

          <div className="border-border my-2 border-t" />

          <div className="flex justify-between py-3 font-medium">
            <span>Total</span>
            <span>₹{cart.total}</span>
          </div>

          <div className="border-border my-2 border-t" />

          <Link to="/checkout">
            <Button className="bg-foreground text-background hover:bg-foreground/90 mt-4 w-full rounded-full py-6 text-base">
              Checkout
            </Button>
          </Link>
        </div>
      </div>
    </Container>
  );
}
