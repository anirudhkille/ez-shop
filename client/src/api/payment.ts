import type { TOrder } from "@/types/order";

import axiosInstance from "@/lib/axiosInstance";

export const createPayment = async (formData: TOrder) => {
  const res = await axiosInstance.post(
    "/payment/create-checkout-session",
    formData
  );

  return res.data;
};
