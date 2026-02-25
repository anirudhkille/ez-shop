import axiosInstance from "@/lib/axiosInstance";

export const getCategorys = async () => {
  const res = await axiosInstance.get(`/category`);
  return res.data;
};
