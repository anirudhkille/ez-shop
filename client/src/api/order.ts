import type { TApiResponse } from "@/types/api";
import type { TOrder, TOrderSummary } from "@/types/order";

import axiosInstance from "@/lib/axiosInstance";

export const placeCodOrder = async (formData: TOrder) => {
  const res = await axiosInstance.post<TApiResponse<{ redirectUrl: string }>>(
    "/order/cod",
    formData
  );

  return res.data;
};

export const getMyOrders = async ({
  page = 1,
  limit = 10,
}: { page?: number; limit?: number } = {}) => {
  const res = await axiosInstance.get<TApiResponse<TOrderSummary[]>>(
    "/order/my-orders",
    { params: { page, limit } }
  );

  return res.data;
};

export const getOrderBySessionId = async (sessionId: string) => {
  const res = await axiosInstance.get(`/order/session-id/${sessionId}`);

  return res.data;
};

export const getOrderById = async (id: string) => {
  const res = await axiosInstance.get(`/order/order-id/${id}`);

  return res.data;
};
