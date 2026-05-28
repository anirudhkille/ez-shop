import axiosInstance from "@/lib/axiosInstance";

export const subscribeNewsletter = async (email: string) => {
  const res = await axiosInstance.post("/newsletter", { email: email });

  return res.data;
};
