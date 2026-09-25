import { create } from "zustand";

import type { TCouponQuote } from "@/api/coupon";

type CouponState = {
  quote: TCouponQuote | null;
  /** Subtotal the quote was priced against, used to detect a stale discount. */
  quotedSubtotal: number;

  setQuote: (quote: TCouponQuote, subtotal: number) => void;
  clear: () => void;
};

/**
 * Holds the coupon the shopper has applied. It lives in a store rather than
 * page state so applying a code on the cart carries through to checkout.
 *
 * The quote is a preview only: the server recomputes the discount from the
 * real cart when the order is placed, so this can never change what is charged.
 */
export const useCouponStore = create<CouponState>()((set) => ({
  quote: null,
  quotedSubtotal: 0,

  setQuote: (quote, subtotal) => set({ quote, quotedSubtotal: subtotal }),
  clear: () => set({ quote: null, quotedSubtotal: 0 }),
}));
