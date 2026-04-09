import { useMutation, useQuery } from "@tanstack/react-query";

import { toast } from "sonner";

import type { TOrder } from "@/types/order";

import { getOrderById, getOrderBySessionId, placeCodOrder } from "@/api/order";
import useUserStore from "@/store/userStore";

export const usePlaceCodOrder = () => {
  return useMutation({
    mutationFn: (formData: TOrder) => placeCodOrder(formData),
    onSuccess: (data) => {
      window.location.href = data.url || data.redirectUrl;
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
  const { token } = useUserStore();
  return useQuery({
    queryFn: () => getOrderById(id),
    queryKey: ["order", id],
    enabled: !!id && !!token,
  });
};

export const useOrderBySessionId = (sessionId: string) => {
  const { token } = useUserStore();
  return useQuery({
    queryFn: () => getOrderBySessionId(sessionId),
    queryKey: ["order", "session", sessionId],
    enabled: !!sessionId && !!token,
  });
};
