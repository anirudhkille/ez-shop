import axiosInstance from "@/shared/lib/axiosInstance";

export const subscribeNewsletter = async (email: string) => {
  const res = await axiosInstance.post("/newsletter", { email: email });

  return res.data;
};
