import { useMutation } from "@tanstack/react-query";

import { toast } from "sonner";

import type { TOrder } from "@/types/order";

import { createPayment } from "@/api/payment";

export const usePayment = () => {
  return useMutation({
    mutationFn: (formData: TOrder) => createPayment(formData),

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
