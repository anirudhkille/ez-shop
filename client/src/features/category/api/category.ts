import type { TApiResponse } from "@/shared/lib/api-response";
import { axiosInstance } from "@/shared/lib/axios-instance";

import type { TCategory } from "../types";

export const getCategorys = async () => {
  const res = await axiosInstance.get<TApiResponse<TCategory[]>>(`/category`);
  return res.data;
};
