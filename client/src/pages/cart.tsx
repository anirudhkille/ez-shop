import { Minus, Plus, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router";
import Container from "@/layout/container";
import { useCart, useUpdateCartQty } from "@/hooks/useCart";
import Image from "@/components/ui/img";

export default function Cart() {
  const { data } = useCart();
  const { mutate: updateQty } = useUpdateCartQty();

  const cart = data?.data;

  if (!cart) return null;

  return (
    <Container className=" px-5 sm:px-10 md:px-10 py-10">
      <h1 className="text-2xl font-medium mb-6">Cart</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1">
          {cart.products.map((c: any) => (
            <div key={c._id}>
              <div className="flex gap-4">
                <div className="w-40 h-40 bg-[#f5f5f5] rounded-md shrink-0">
                  <Image
                    src={c.product.image}
                    alt={c.product.name}
                    className="w-full h-full object-contain"
                  />
                </div>

                <div className="flex-1">
                  <div className="flex justify-between">
                    <div>
                      <h3 className="font-medium text-base">
                        {c.product.name}
                      </h3>

                      <p className="text-muted-foreground text-sm mt-1">
                        Size: {c.size || "Free Size"}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-muted-foreground line-through text-sm mr-2">
                        ₹{c.priceAtPurchase}
                      </span>
                      <span className="font-medium">
                        ₹{c.discountPriceAtPurchase}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 mt-6">
                <div className="flex items-center border border-border rounded-full">
                  <button
                    onClick={() =>
                      updateQty({
                        cartItemId: c._id,
                        quantity: Math.max(1, c.quantity - 1),
                      })
                    }
                    className="p-3 hover:bg-muted rounded-l-full transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>

                  <span className="px-4 min-w-10 text-center">
                    {c.quantity}
                  </span>

                  <button
                    onClick={() =>
                      updateQty({
                        cartItemId: c._id,
                        quantity: c.quantity + 1,
                      })
                    }
                    className="p-3 hover:bg-muted rounded-r-full transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <button className="p-3 border border-border rounded-full hover:bg-muted transition-colors">
                  <Heart className="w-5 h-5" />
                </button>
              </div>

              <div className="border-t border-border mt-8" />
            </div>
          ))}
        </div>

        <div className="w-full lg:w-80">
          <h2 className="text-xl font-medium mb-6">Summary</h2>

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

          <div className="border-t border-border my-2" />

          <div className="flex justify-between py-3 font-medium">
            <span>Total</span>
            <span>₹{cart.total}</span>
          </div>

          <div className="border-t border-border my-2" />

          <Link to="/checkout">
            <Button className="w-full mt-4 rounded-full py-6 text-base bg-foreground text-background hover:bg-foreground/90">
              Checkout
            </Button>
          </Link>
        </div>
      </div>
    </Container>
  );
}
