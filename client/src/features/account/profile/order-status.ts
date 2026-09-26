import type { TOrderProduct, TOrderSummary } from "@/types/order";

/**
 * `orderStatus` is constrained by the server enum to
 * processing | shipped | delivered (server/src/modules/order/order.model.ts),
 * so the filter row only offers statuses an order can actually hold.
 */
export const ORDER_STATUS_FILTERS = [
  "all",
  "processing",
  "shipped",
  "delivered",
] as const;

export type TOrderStatusFilter = (typeof ORDER_STATUS_FILTERS)[number];

const STATUS_META: Record<string, { label: string; className: string }> = {
  processing: {
    label: "Processing",
    className: "border-amber-400/20 bg-amber-400/10 text-amber-400",
  },
  shipped: {
    label: "Shipped",
    className: "border-brand-orange/20 bg-brand-orange/10 text-brand-orange",
  },
  delivered: {
    label: "Delivered",
    className: "border-green-400/20 bg-green-400/10 text-green-400",
  },
};

export const getOrderStatusMeta = (status?: string) =>
  STATUS_META[status ?? ""] ?? {
    label: status || "Unknown",
    className: "border-brand-border bg-muted/40 text-muted-foreground",
  };

export const matchesStatusFilter = (
  order: TOrderSummary,
  filter: TOrderStatusFilter
): boolean => filter === "all" || order.orderStatus === filter;

/**
 * `products[].product` is populated by the server
 * (order.repository.ts -> findByUser), but a populate can still fail per
 * document, so callers narrow it instead of assuming an object.
 */
export const getLineItemProduct = (product: TOrderProduct["product"]) =>
  typeof product === "string" ? null : product;
