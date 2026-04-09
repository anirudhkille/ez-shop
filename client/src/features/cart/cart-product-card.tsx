import { Link } from "react-router";
import { Minus, Plus, X } from "lucide-react";

import { formatPrice } from "@/lib/formatPrice";
import { useRemoveCartItem, useUpdateCartQty } from "@/hooks/useCart";

export default function CartProductCard({ item }) {
  const { mutate: removeCartItem } = useRemoveCartItem();
  const { mutate: updateCartQty } = useUpdateCartQty();

  const handleIncrease = () => {
    updateCartQty({
      cartItemId: item._id,
      quantity: item.quantity + 1,
    });
  };

  const handleDecrease = () => {
    if (item.quantity <= 1) return; // prevent 0 or negative
    updateCartQty({
      cartItemId: item._id,
      quantity: item.quantity - 1,
    });
  };

  return (
    <div className="bg-card border-brand-border group flex gap-5 rounded-2xl border p-5">
      <Link
        to={`/${item.product.slug}/${item.product._id}`}
        className="shrink-0"
      >
        <div className="bg-brand-surface-raised flex h-24 w-24 items-center justify-center overflow-hidden rounded-xl">
          <img
            src={item.product.image}
            alt={item.product.name}
            className="h-full w-full object-contain p-2 transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      </Link>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className="font-body text-muted-foreground text-[10px] tracking-widest uppercase">
              {item.product.category}
            </span>

            <Link
              to={`/${item.product.slug}/${item.product._id}`}
            >
              <h3 className="font-display text-foreground hover:text-brand-orange text-lg font-bold transition-colors">
                {item.product.name}
              </h3>
            </Link>

            <p className="font-body text-muted-foreground mt-1 text-xs">
              Size: US {item.size}
            </p>
          </div>

          <button
            className="text-muted-foreground hover:text-foreground shrink-0 transition-colors"
            onClick={() => removeCartItem(item._id)}
          >
            <X size={16} />
          </button>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="border-brand-border flex items-center overflow-hidden rounded-xl border">
            <button
              onClick={handleDecrease}
              className="text-muted-foreground hover:text-foreground flex h-9 w-9 items-center justify-center transition-colors"
            >
              <Minus size={13} />
            </button>

            <span className="font-body text-foreground w-9 text-center text-sm font-semibold">
              {item.quantity}
            </span>

            <button
              onClick={handleIncrease}
              className="text-muted-foreground hover:text-foreground flex h-9 w-9 items-center justify-center transition-colors"
            >
              <Plus size={13} />
            </button>
          </div>

          <div className="text-right">
            <div className="font-display text-brand-orange text-xl font-bold">
              {formatPrice(item.product.price * item.quantity)}
            </div>

            {item.quantity > 1 && (
              <div className="font-body text-muted-foreground text-xs">
                {formatPrice(item.product.price)} each
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}