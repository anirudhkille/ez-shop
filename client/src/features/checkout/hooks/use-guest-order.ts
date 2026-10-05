import { useMutation } from "@tanstack/react-query";

import { toast } from "sonner";

import { useCartStore } from "@/features/cart";
import { getErrorMessage } from "@/shared/lib/api-error";

import {
  createGuestCheckoutSession,
  placeGuestCODOrder,
  type TGuestOrderPayload,
} from "../api/guest-order";

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
