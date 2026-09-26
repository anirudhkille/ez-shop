import { useEffect, useRef } from "react";

import { useMyOrdersList } from "@/hooks/useOrder";

import { OrderList } from "./order-list";
import { PanelHeader } from "./panel";

export default function OrdersPanel() {
  const { orders, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useMyOrdersList();

  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!loadMoreRef.current || !hasNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1, rootMargin: "200px" }
    );

    observer.observe(loadMoreRef.current);

    return () => observer.disconnect();
  }, [hasNextPage, fetchNextPage, isFetchingNextPage]);

  return (
    <>
      <PanelHeader
        title="Your orders"
        subtitle={
          isLoading
            ? "Loading your orders…"
            : `${orders.length} order${orders.length === 1 ? "" : "s"} placed with EZ Shop.`
        }
      />

      <OrderList orders={orders} isLoading={isLoading} />

      {isFetchingNextPage ? (
        <p
          className="font-body text-muted-foreground py-6 text-center text-sm"
          aria-live="polite"
        >
          Loading more orders…
        </p>
      ) : null}

      {hasNextPage ? (
        <div ref={loadMoreRef} className="h-4 w-full" aria-hidden="true" />
      ) : null}
    </>
  );
}
