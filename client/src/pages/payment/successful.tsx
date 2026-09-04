import { useEffect } from "react";

import { useSearchParams } from "react-router";

import { useQueryClient } from "@tanstack/react-query";

import { useCartStore } from "@/store/cartStore";
import useUserStore from "@/store/userStore";

import { useOrderById, useOrderBySessionId } from "@/hooks/useOrder";

import OrderSuccess from "@/features/payment/order-success";

export default function SuccessPage() {
  const [q] = useSearchParams();
  const orderId = q.get("orderId");
  const sessionId = q.get("session_id");

  const { token, email } = useUserStore();
  const clearGuestCart = useCartStore((s) => s.clearCart);
  const queryClient = useQueryClient();

  // Fetch COD order by orderId
  const { data: orderById, isLoading: loadingId } = useOrderById(orderId ?? "");

  // Fetch Card order by Stripe sessionId
  const { data: orderBySession, isLoading: loadingSession } =
    useOrderBySessionId(sessionId ?? "");

  const order = orderById?.data || orderBySession?.data;

  useEffect(() => {
    if (!order) return;

    if (token) {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      queryClient.invalidateQueries({ queryKey: ["cartCount"] });
    } else {
      clearGuestCart();
    }
  }, [order?._id, token, clearGuestCart]);

  // Loading state
  if ((orderId && loadingId) || (sessionId && loadingSession)) {
    return <div className="py-10 text-center">Loading...</div>;
  }

  // COD path
  if (orderId && orderById) {
    return (
      <OrderSuccess
        order={orderById.data}
        email={orderById?.data?.email || email || ""}
        allowShowFull={!!token}
      />
    );
  }

  if (sessionId && orderBySession) {
    return (
      <OrderSuccess
        order={orderBySession.data}
        email={orderBySession?.data?.email || email || ""}
        allowShowFull={!!token}
      />
    );
  }

  return (
    <div className="py-20 text-center">
      <h2 className="text-xl font-semibold">Invalid request</h2>
      <p className="mt-2 text-gray-600">
        No order information found. Please return to the home page.
      </p>
    </div>
  );
}
