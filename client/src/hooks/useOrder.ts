import { useMemo } from "react";

import { useInfiniteQuery, useMutation, useQuery } from "@tanstack/react-query";

import { toast } from "sonner";

import type { TOrder, TOrderDetail } from "@/types/order";

import {
  createGuestCheckoutSession,
  placeGuestCODOrder,
  type TGuestOrderPayload,
} from "@/api/guest-order";
import {
  getMyOrders,
  getOrderById,
  getOrderBySessionId,
  placeCodOrder,
} from "@/api/order";

import { useCartStore } from "@/store/cartStore";
import useUserStore from "@/store/userStore";

import { getErrorMessage } from "@/shared/lib/apiError";
import type { TApiResponse } from "@/shared/types/api";

export const usePlaceCodOrder = () => {
  return useMutation({
    mutationFn: (formData: TOrder) => placeCodOrder(formData),
    onSuccess: (data) => {
      if (data.data?.redirectUrl) {
        window.location.href = data.data.redirectUrl;
      }
    },

    onError: (error) => {
      toast.error(
        getErrorMessage(error, "An error occurred while creating order")
      );
    },
  });
};

export const useOrderById = (id: string) => {
  return useQuery({
    queryFn: () => getOrderById(id),
    queryKey: ["order", id],
    enabled: !!id,
  });
};

/**
 * Same endpoint and cache entry as `useOrderById`, but with the payload typed
 * for the account order detail page. `getOrderById` stays untyped because the
 * payment-success view reads guest-only fields (`email`, `sessionId`) that are
 * not part of `TOrderDetail`, so the cast is confined to this boundary.
 */
export const useOrderDetail = (id: string) => {
  return useQuery({
    queryFn: () => getOrderById(id),
    queryKey: ["order", id],
    select: (res) => res as TApiResponse<TOrderDetail>,
    enabled: !!id,
  });
};

export const useOrderBySessionId = (sessionId: string) => {
  return useQuery({
    queryFn: () => getOrderBySessionId(sessionId),
    queryKey: ["order", "session", sessionId],
    enabled: !!sessionId,
  });
};

export const usePlaceGuestCODOrder = () => {
  const clearCart = useCartStore((s) => s.clearCart);

  return useMutation({
    mutationFn: (payload: TGuestOrderPayload) => placeGuestCODOrder(payload),
    onSuccess: (data) => {
      clearCart();
      window.location.href = data.data.redirectUrl;
    },
    onError: (error) => {
      toast.error(
        getErrorMessage(error, "An error occurred while creating order")
      );
    },
  });
};

export const useGuestPayment = () => {
  return useMutation({
    mutationFn: (payload: TGuestOrderPayload) =>
      createGuestCheckoutSession(payload),
    onSuccess: (data) => {
      window.location.href = data.data.url;
    },
    onError: (error) => {
      toast.error(
        getErrorMessage(error, "An error occurred while creating payment")
      );
    },
  });
};

export const useMyOrders = () => {
  const { token } = useUserStore();

  return useInfiniteQuery({
    queryKey: ["my-orders"],
    initialPageParam: 1,
    queryFn: ({ pageParam }) => getMyOrders({ page: pageParam }),
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage.pagination ?? {};

      return page !== undefined && totalPages !== undefined && page < totalPages
        ? page + 1
        : undefined;
    },
    enabled: !!token,
  });
};

/** Flattens the paged response into a single newest-first list. */
export const useMyOrdersList = () => {
  const query = useMyOrders();

  const orders = useMemo(
    () => query.data?.pages.flatMap((page) => page.data) ?? [],
    [query.data]
  );

  return { ...query, orders };
};
