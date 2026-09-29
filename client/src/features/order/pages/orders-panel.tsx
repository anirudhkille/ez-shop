import PanelHeader from "@/shared/components/panel-header";
import { useInfiniteScroll } from "@/shared/hooks/use-infinite-scroll";

import { OrderList } from "../components/order-list";
import { useMyOrdersList } from "../hooks/useOrder";

export default function OrdersPanel() {
  const { orders, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useMyOrdersList();

  const loadMoreRef = useInfiniteScroll(
    fetchNextPage,
    !!hasNextPage && !isFetchingNextPage
  );

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
