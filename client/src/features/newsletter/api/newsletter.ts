import { axiosInstance } from "@/shared/lib/axios-instance";

export const subscribeNewsletter = async (email: string) => {
  const res = await axiosInstance.post("/newsletter", { email: email });

  return res.data;
};
