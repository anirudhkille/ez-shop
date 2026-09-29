import { Heart, Minus, Plus, ShoppingCart } from "lucide-react";

interface ActionProps {
  quantity: number;
  onQuantityChange: (quantity: number) => void;
  canAdd: boolean;
  onAddToCart: () => void;
  liked: boolean;
  onToggleWishlist: () => void;
}

export function ProductActions({
  quantity,
  onQuantityChange,
  canAdd,
  onAddToCart,
  liked,
  onToggleWishlist,
}: ActionProps) {
  return (
    <div className="mt-8 hidden items-center gap-4 lg:flex">
      <div className="border-brand-border flex items-center overflow-hidden rounded-xl border">
        <button
          onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
          aria-label="Decrease quantity"
          className="text-muted-foreground hover:text-foreground flex h-12 w-10 items-center justify-center transition-colors"
        >
          <Minus size={14} />
        </button>
        <span className="font-body text-foreground w-10 text-center font-semibold">
          {quantity}
        </span>
        <button
          onClick={() => onQuantityChange(quantity + 1)}
          aria-label="Increase quantity"
          className="text-muted-foreground hover:text-foreground flex h-12 w-10 items-center justify-center transition-colors"
        >
          <Plus size={14} />
        </button>
      </div>

      <button
        onClick={onAddToCart}
        disabled={!canAdd}
        className={`font-body flex h-12 flex-1 items-center justify-center gap-2 rounded-xl text-sm font-semibold tracking-wider uppercase transition-colors duration-300 ${
          canAdd
            ? "bg-brand-orange text-primary-foreground hover:bg-brand-orange-glow"
            : "bg-muted text-muted-foreground cursor-not-allowed"
        }`}
      >
        <ShoppingCart size={16} />
        Add to Cart
      </button>

      <button
        aria-label={liked ? "Remove from wishlist" : "Save to wishlist"}
        aria-pressed={liked}
        className={`flex h-12 w-12 items-center justify-center rounded-xl border transition-colors duration-200 ${liked ? "border-red-500/40 bg-red-500/10" : "border-brand-border hover:border-brand-orange/40"}`}
        onClick={onToggleWishlist}
      >
        <Heart
          size={16}
          className={
            liked ? "fill-red-500 text-red-500" : "text-muted-foreground"
          }
        />
      </button>
    </div>
  );
}

export function ProductMobileBar(props: ActionProps) {
  return (
    <div className="bg-background/95 border-brand-border fixed right-0 bottom-0 left-0 z-50 border-t px-4 py-3 backdrop-blur-md lg:hidden">
      <div className="flex items-center gap-3">
        <div className="border-brand-border flex items-center overflow-hidden rounded-xl border">
          <button
            onClick={() =>
              props.onQuantityChange(Math.max(1, props.quantity - 1))
            }
            aria-label="Decrease quantity"
            className="text-muted-foreground hover:text-foreground flex h-11 w-9 items-center justify-center transition-colors"
          >
            <Minus size={13} />
          </button>
          <span className="font-body text-foreground w-8 text-center text-sm font-semibold">
            {props.quantity}
          </span>
          <button
            onClick={() => props.onQuantityChange(props.quantity + 1)}
            aria-label="Increase quantity"
            className="text-muted-foreground hover:text-foreground flex h-11 w-9 items-center justify-center transition-colors"
          >
            <Plus size={13} />
          </button>
        </div>

        <button
          onClick={props.onAddToCart}
          disabled={!props.canAdd}
          className={`font-body flex h-11 flex-1 items-center justify-center gap-2 rounded-xl text-sm font-semibold tracking-wider uppercase transition-colors duration-300 ${
            props.canAdd
              ? "bg-brand-orange text-primary-foreground hover:bg-brand-orange-glow"
              : "bg-muted text-muted-foreground cursor-not-allowed"
          }`}
        >
          <ShoppingCart size={15} />
          {props.canAdd ? "Add to Cart" : "Select Size"}
        </button>

        <button
          aria-label={props.liked ? "Remove from wishlist" : "Save to wishlist"}
          aria-pressed={props.liked}
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border transition-colors duration-200 ${
            props.liked
              ? "border-red-500/40 bg-red-500/10"
              : "border-brand-border hover:border-brand-orange/40"
          }`}
          onClick={props.onToggleWishlist}
        >
          <Heart
            size={16}
            className={
              props.liked
                ? "fill-red-500 text-red-500"
                : "text-muted-foreground"
            }
          />
        </button>
      </div>
    </div>
  );
}
