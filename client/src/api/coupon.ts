import axiosInstance from "@/lib/axiosInstance";

export type TCouponQuote = {
  code: string;
  type: "percentage" | "fixed";
  value: number;
  discount: number;
};

/**
 * Quotes a coupon against the current subtotal so the cart can show the
 * discount before the order is placed. The server recomputes the real amount
 * when the order is created, so this value is display-only.
 */
export const applyCoupon = async (code: string, subtotal: number) => {
  const res = await axiosInstance.post("/coupon/apply", { code, subtotal });

  return res.data.data as TCouponQuote;
};
