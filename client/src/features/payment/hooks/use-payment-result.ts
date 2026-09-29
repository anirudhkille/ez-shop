import { useEffect } from "react";

import { useSearchParams } from "react-router";

import { useQueryClient } from "@tanstack/react-query";

import { useUserStore } from "@/features/auth";
import { useCartStore } from "@/features/cart";
import { useOrderById, useOrderBySessionId } from "@/features/order";

export const usePaymentResult = () => {
  const [params] = useSearchParams();
  const orderId = params.get("orderId");
  const sessionId = params.get("session_id");

  const { token, email } = useUserStore();
  const clearGuestCart = useCartStore((s) => s.clearCart);
  const queryClient = useQueryClient();

  const { data: orderById, isLoading: loadingId } = useOrderById(orderId ?? "");
  const { data: orderBySession, isLoading: loadingSession } =
    useOrderBySessionId(sessionId ?? "");

  const order = orderById?.data ?? orderBySession?.data;
  const found = !!orderById?.data || !!orderBySession?.data;

  useEffect(() => {
    if (!found) return;

    if (token) {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      queryClient.invalidateQueries({ queryKey: ["cartCount"] });
    } else {
      clearGuestCart();
    }
  }, [found, token, clearGuestCart, queryClient]);

  return {
    order,
    found,
    isLoading: (!!orderId && loadingId) || (!!sessionId && loadingSession),
    email: order?.email || email || "",
    allowShowFull: !!token,
  };
};
