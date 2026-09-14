import { useMutation } from "@tanstack/react-query";

import { toast } from "sonner";

import { getErrorMessage } from "@/lib/apiError";

import { subscribeNewsletter } from "@/api/newsletter";

export const useSubscribeNewsletter = () => {
  return useMutation({
    mutationFn: (email: string) => subscribeNewsletter(email),
    onError: (error) => {
      toast.error(
        getErrorMessage(error, "Failed to subscribe. Please try again.")
      );
    },
  });
};
