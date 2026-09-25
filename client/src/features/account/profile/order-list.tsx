import { FC } from "react";

import { formatPrice } from "@/lib/formatPrice";

import { getOrderStatusMeta } from "./order-status";
import type { TProfileOrder } from "./types";

export interface OrderListProps {
  orders?: TProfileOrder[];
  isLoading?: boolean;
  compact?: boolean;
}

export const OrderList: FC<OrderListProps> = ({
  orders = [],
  isLoading = false,
  compact = false,
}) => {
  const toShow = compact ? orders.slice(0, 3) : orders;

  const renderRow = (order: TProfileOrder) => (
    <div
      key={order._id}
      className="border-brand-border/50 flex items-center justify-between border-b py-4 last:border-0"
    >
      <div className="flex items-center gap-3">
        <div className="bg-brand-surface-raised flex h-10 w-10 items-center justify-center rounded-xl">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M4 9v9h16V9H4zm2-2h12l-1-3H7l-1 3z" fill="currentColor" />
          </svg>
        </div>
        <div>
          <p className="font-body text-foreground text-sm font-semibold">
            #{order._id?.slice(-6).toUpperCase()}
          </p>
          <p className="font-body text-muted-foreground text-xs">
            {new Date(order.createdAt).toLocaleDateString()} ·{" "}
            {order.products?.length ?? 0} item
            {(order.products?.length ?? 0) > 1 ? "s" : ""}
          </p>
        </div>
      </div>
      <div className="text-right">
        <p className="font-display text-brand-orange text-base font-bold">
          {formatPrice(order.totalAmount)}
        </p>
        <span
          className={`font-body rounded-full border px-2 py-0.5 text-[10px] font-semibold ${getOrderStatusMeta(order.orderStatus).className}`}
        >
          {getOrderStatusMeta(order.orderStatus).label}
        </span>
      </div>
    </div>
  );

  if (isLoading) {
    return Array.from({ length: 3 }, (_, i) => (
      <div key={i} className="flex animate-pulse items-center gap-3 py-4">
        <div className="bg-muted-foreground/30 h-10 w-10 rounded-xl"></div>
        <div className="flex-1 space-y-2">
          <div className="bg-muted-foreground/30 h-4 w-1/4 rounded"></div>
          <div className="bg-muted-foreground/30 h-3 w-1/3 rounded"></div>
        </div>
        <div className="bg-muted-foreground/30 h-4 w-1/4 rounded"></div>
      </div>
    ));
  }

  if (!orders.length) {
    return (
      <div className="py-8 text-center">
        <svg
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 9v6m3-3h-6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <p className="font-body text-muted-foreground mt-4">No orders yet</p>
        <a
          href="/products"
          className="bg-brand-orange text-primary-foreground font-body mt-4 inline-block rounded-full px-6 py-3"
        >
          Browse products
        </a>
      </div>
    );
  }

  return (
    <div className="border-brand-border divide-brand-border divide-y">
      {toShow.map(renderRow)}
    </div>
  );
};
