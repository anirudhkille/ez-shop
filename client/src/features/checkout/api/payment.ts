import type { TOrder } from "@/features/order";
import { axiosInstance } from "@/shared/lib/axios-instance";

export const createPayment = async (formData: TOrder) => {
  const res = await axiosInstance.post(
    "/payment/create-checkout-session",
    formData
  );

  return res.data;
};
