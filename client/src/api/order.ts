import axiosInstance from "@/lib/axiosInstance";
import type { TOrder } from "@/types/order";

export const placeCodOrder = async (formData: TOrder) => {
  const res = await axiosInstance.post("/order/cod", formData);

  return res.data;
};

export const getMyOrders = async () => {
  const res = await axiosInstance.get("/order/my-orders");
  return res.data;
};

export const getOrderBySessionId = async (sessionId: string) => {
  const res = await axiosInstance.get(`/order/session-id/${sessionId}`);
  return res.data;
};

export const getOrderById = async (id: string) => {
  const res = await axiosInstance.get(`/order/session-id/${id}`);
  return res.data;
};
