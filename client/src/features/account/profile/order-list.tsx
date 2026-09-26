import { useMemo, useState } from "react";

import { Link } from "react-router";

import { ChevronRight, Package } from "lucide-react";

import type { TOrderSummary } from "@/types/order";

import { formatPrice } from "@/shared/lib/formatPrice";

import { OrderLineItems, OrderStatusPill } from "./order-line-items";
import {
  matchesStatusFilter,
  ORDER_STATUS_FILTERS,
  type TOrderStatusFilter,
} from "./order-status";

/** Line items shown before the "+N more" toggle appears. */
const COLLAPSED_ITEM_COUNT = 2;

interface OrderListProps {
  orders?: TOrderSummary[];
  isLoading?: boolean;
  /** Hide the filter chips and force every line item open (overview panel). */
  compact?: boolean;
}

function shortOrderId(id: string) {
  return id.slice(-6).toUpperCase();
}

function OrderCard({
  order,
  collapsible,
}: {
  order: TOrderSummary;
  collapsible: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const items = order.products ?? [];
  // Sum quantities rather than counting lines, so "Qty 2" reads as 2 items and
  // matches the order detail page and the server's own itemCount aggregation.
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const isExpandable = collapsible && items.length > COLLAPSED_ITEM_COUNT;
  const visibleItems =
    isExpandable && !expanded ? items.slice(0, COLLAPSED_ITEM_COUNT) : items;
  const hiddenCount = items.length - visibleItems.length;

  return (
    <article className="bg-card border-brand-border rounded-2xl border">
      <header className="border-brand-border/40 flex flex-wrap items-center justify-between gap-3 border-b px-5 py-4">
        <div className="min-w-0">
          <h3 className="font-display text-foreground text-base font-bold">
            #{shortOrderId(order._id)}
          </h3>
          <p className="font-body text-muted-foreground mt-0.5 text-xs">
            Placed {new Date(order.createdAt).toLocaleDateString("en-IN")} ·{" "}
            {itemCount} item{itemCount === 1 ? "" : "s"}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <OrderStatusPill status={order.orderStatus} />
          <p className="font-display text-brand-orange text-base font-bold whitespace-nowrap">
            {formatPrice(order.totalAmount)}
          </p>
          <Link
            to={`/account/orders/${order._id}`}
            aria-label={`View details for order ${shortOrderId(order._id)}`}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronRight size={16} aria-hidden />
          </Link>
        </div>
      </header>

      <OrderLineItems items={visibleItems} />

      {isExpandable ? (
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          aria-expanded={expanded}
          className="font-body text-brand-orange hover:text-brand-orange/80 w-full px-5 py-3 text-left text-xs font-semibold"
        >
          {expanded
            ? "Show fewer items"
            : `+ ${hiddenCount} more item${hiddenCount === 1 ? "" : "s"}`}
        </button>
      ) : null}
    </article>
  );
}

export function OrderList({
  orders = [],
  isLoading = false,
  compact = false,
}: OrderListProps) {
  const [filter, setFilter] = useState<TOrderStatusFilter>("all");

  const visibleOrders = useMemo(
    () => orders.filter((order) => matchesStatusFilter(order, filter)),
    [orders, filter]
  );

  if (isLoading) {
    return (
      <div className="space-y-3" aria-busy>
        {Array.from({ length: compact ? 2 : 3 }, (_, i) => (
          <div
            key={i}
            className="bg-card border-brand-border animate-pulse rounded-2xl border p-5"
          >
            <div className="bg-muted-foreground/25 mb-4 h-4 w-32 rounded" />
            <div className="bg-muted-foreground/25 h-12 w-full rounded-lg" />
          </div>
        ))}
      </div>
    );
  }

  if (!orders.length) {
    return (
      <div className="py-14 text-center">
        <Package size={40} className="text-muted-foreground/30 mx-auto mb-3" />
        <p className="font-body text-muted-foreground text-sm">No orders yet</p>
        <Link
          to="/products"
          className="bg-brand-orange text-primary-foreground font-body mt-5 inline-block rounded-full px-6 py-3 text-sm font-semibold"
        >
          Start shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {!compact && (
        <div
          role="group"
          aria-label="Filter orders by status"
          className="flex flex-wrap gap-2"
        >
          {ORDER_STATUS_FILTERS.map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setFilter(status)}
              aria-pressed={filter === status}
              className={`font-body rounded-full border px-3.5 py-1.5 text-xs font-semibold capitalize transition-colors ${
                filter === status
                  ? "border-brand-orange bg-brand-orange/10 text-brand-orange"
                  : "border-brand-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      )}

      {visibleOrders.length === 0 ? (
        <p className="font-body text-muted-foreground py-10 text-center text-sm">
          No orders with this status.
        </p>
      ) : (
        visibleOrders.map((order) => (
          <OrderCard key={order._id} order={order} collapsible={!compact} />
        ))
      )}
    </div>
  );
}
