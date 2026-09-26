import { useMutation } from "@tanstack/react-query";

import { toast } from "sonner";

import { downloadInvoiceForOrder } from "@/api/invoice";

export const useDownloadInvoice = () => {
  return useMutation({
    mutationFn: downloadInvoiceForOrder,
    onSuccess: (filename) => {
      toast.success(`Downloaded ${filename}`);
    },
    onError: (error) => {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not download the invoice"
      );
    },
  });
};
