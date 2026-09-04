import { useMutation, useQuery } from "@tanstack/react-query";

import { toast } from "sonner";

import type { TOrder } from "@/types/order";

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

export const usePlaceCodOrder = () => {
  return useMutation({
    mutationFn: (formData: TOrder) => placeCodOrder(formData),
    onSuccess: (data) => {
      if (data.redirectUrl) {
        window.location.href = data.redirectUrl;
      }
    },

    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message ||
          "An error occurred while creating order"
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
      window.location.href = data.redirectUrl;
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message ||
          "An error occurred while creating order"
      );
    },
  });
};

export const useGuestPayment = () => {
  return useMutation({
    mutationFn: (payload: TGuestOrderPayload) =>
      createGuestCheckoutSession(payload),
    onSuccess: (data) => {
      window.location.href = data.url;
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message ||
          "An error occurred while creating payment"
      );
    },
  });
};

export const useMyOrders = () => {
  const { token } = useUserStore();
  return useQuery({
    queryFn: getMyOrders,
    queryKey: ["my-orders"],
    select: (data) => data.data,
    enabled: !!token,
  });
};
