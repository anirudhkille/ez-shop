import type { FC } from "react";

import { Link } from "react-router";

import { ImageOff } from "lucide-react";

import { formatPrice } from "@/shared/lib/format-price";

import { getLineItemProduct, getOrderStatusMeta } from "../lib/order-status";
import type { TOrderProduct } from "../types";

export const OrderStatusPill: FC<{ status?: string }> = ({ status }) => {
  const meta = getOrderStatusMeta(status);

  return (
    <span
      className={`font-body inline-flex shrink-0 items-center rounded-full border px-2.5 py-1 text-[10px] font-semibold ${meta.className}`}
    >
      {meta.label}
    </span>
  );
};

const LineItem: FC<{ item: TOrderProduct; reviewable: boolean }> = ({
  item,
  reviewable,
}) => {
  const product = getLineItemProduct(item.product);
  const meta = [item.size, `Qty ${item.quantity}`].filter(Boolean).join(" · ");
  const reviewHref = product?._id
    ? `/${product.slug ?? "product"}/${product._id}#reviews`
    : null;

  return (
    <li className="border-brand-border/40 flex flex-wrap items-center gap-3 border-t py-3 first:border-t-0">
      <div className="bg-brand-surface-raised flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-lg">
        {product?.image ? (
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-contain"
          />
        ) : (
          <ImageOff
            size={16}
            className="text-muted-foreground/50"
            aria-hidden
          />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="font-body text-foreground truncate text-sm font-medium">
          {product?.name ?? "Product unavailable"}
        </p>
        <p className="font-body text-muted-foreground truncate text-xs">
          {meta}
        </p>
      </div>

      {reviewable && reviewHref && (
        <Link
          to={reviewHref}
          className="font-body text-brand-orange hover:text-brand-orange/80 shrink-0 text-xs font-semibold"
        >
          Write a review
        </Link>
      )}

      {/* `price` is the unit price at purchase; the server sums
          `price * quantity`, so a bare value would read as a line total. */}
      <p className="font-body text-foreground shrink-0 text-sm font-semibold">
        {item.quantity > 1
          ? `${item.quantity} × ${formatPrice(item.price)}`
          : formatPrice(item.price)}
      </p>
    </li>
  );
};

export interface OrderLineItemsProps {
  items?: TOrderProduct[];
  orderStatus?: string;
}

/** Shared by the account orders list and the order detail page. */
export const OrderLineItems: FC<OrderLineItemsProps> = ({
  items,
  orderStatus,
}) => {
  const reviewable = orderStatus === "delivered";

  if (!items?.length) {
    return (
      <p className="font-body text-muted-foreground px-5 py-4 text-sm">
        No line items recorded for this order.
      </p>
    );
  }

  return (
    <ul className="px-5">
      {items.map((item, index) => (
        <LineItem
          key={getLineItemProduct(item.product)?._id ?? index}
          item={item}
          reviewable={reviewable}
        />
      ))}
    </ul>
  );
};
