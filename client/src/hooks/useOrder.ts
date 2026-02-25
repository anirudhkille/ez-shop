import { useMutation, useQuery } from "@tanstack/react-query";

import { toast } from "sonner";

import type { TOrder } from "@/types/order";

import { getOrderById, getOrderBySessionId, placeCodOrder } from "@/api/order";

export const usePlaceCodOrder = () => {
  return useMutation({
    mutationFn: (formData: TOrder) => placeCodOrder(formData),
    onSuccess: (data) => {
      window.location.href = data.url;
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
