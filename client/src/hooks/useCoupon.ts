import { useMutation } from "@tanstack/react-query";

import { toast } from "sonner";

import { applyCoupon, type TCouponQuote } from "@/api/coupon";

import { getErrorMessage } from "@/shared/lib/apiError";

/**
 * Quotes a coupon for the current subtotal. The returned discount is a
 * preview: the server recomputes it from the real cart when the order is
 * placed, so a stale or tampered quote can never change what is charged.
 */
export const useApplyCoupon = () => {
  return useMutation<TCouponQuote, unknown, { code: string; subtotal: number }>(
    {
      mutationFn: ({ code, subtotal }) => applyCoupon(code, subtotal),
      onSuccess: (quote) => {
        toast.success(`Coupon ${quote.code} applied`);
      },
      onError: (error) => {
        toast.error(getErrorMessage(error, "Could not apply that coupon"));
      },
    }
  );
};
