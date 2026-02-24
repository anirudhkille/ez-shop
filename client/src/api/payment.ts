import axiosInstance from "@/lib/axiosInstance";
import type { TOrder } from "@/types/order";

export const createPayment = async (formData: TOrder) => {
  const res = await axiosInstance.post(
    "/payment/create-checkout-session",
    formData
  );

  return res.data;
};
