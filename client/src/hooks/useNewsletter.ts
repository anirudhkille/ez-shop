import { useMutation } from "@tanstack/react-query";

import { toast } from "sonner";

import { subscribeNewsletter } from "@/api/newsletter";

export const useSubscribeNewsletter = () => {
  return useMutation({
    mutationFn: (email: string) => subscribeNewsletter(email),
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Failed to subscribe. Please try again.",
      );
    },
  });
};
