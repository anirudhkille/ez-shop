import { useMutation } from "@tanstack/react-query";

import { subscribeNewsletter } from "@/api/newsletter";

export const useSubscribeNewsletter = () => {
  return useMutation({
    mutationFn: (email: string) => subscribeNewsletter(email),
  });
};
