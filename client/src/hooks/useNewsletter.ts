import { useMutation } from "@tanstack/react-query";

import { toast } from "sonner";

import { subscribeNewsletter } from "@/api/newsletter";

import { getErrorMessage } from "@/shared/lib/apiError";

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
