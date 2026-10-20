import { useEffect } from "react";

import { useSearchParams } from "react-router";

import { useQueryClient } from "@tanstack/react-query";

import { useUserStore } from "@/features/auth";
import { useCartStore } from "@/features/cart";
import { useOrderById, useOrderBySessionId } from "@/features/order";

/** Card orders only settle once the Stripe webhook lands, so keep asking. */
const POLL_INTERVAL_MS = 3000;
const MAX_POLLS = 10;

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
  const pendingCard =
    order?.paymentType === "card" && order?.paymentStatus === "pending";
  const hasId = !!orderById?.data;

  useEffect(() => {
    if (!found) return;

    if (token) {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      queryClient.invalidateQueries({ queryKey: ["cartCount"] });
    } else {
      clearGuestCart();
    }
  }, [found, token, clearGuestCart, queryClient]);

  useEffect(() => {
    if (!pendingCard) return;

    const queryKey = hasId
      ? (["order", orderId ?? ""] as const)
      : (["order", "session", sessionId ?? ""] as const);

    let ticks = 0;
    const timer = setInterval(() => {
      ticks += 1;

      if (ticks > MAX_POLLS) {
        clearInterval(timer);
        return;
      }

      queryClient.invalidateQueries({ queryKey });
    }, POLL_INTERVAL_MS);

    return () => clearInterval(timer);
  }, [pendingCard, hasId, orderId, sessionId, queryClient]);

  return {
    order,
    found,
    isLoading: (!!orderId && loadingId) || (!!sessionId && loadingSession),
    email: order?.email || email || "",
    allowShowFull: !!token,
  };
};
