import axiosInstance from "@/shared/lib/axiosInstance";
import type { TAddress } from "@/shared/types/address";

export const postAddress = async (formData: TAddress) => {
  const res = await axiosInstance.post("/address", formData);

  return res.data;
};

export const getAddresses = async () => {
  const res = await axiosInstance.get(`/address`);
  return res.data;
};

export const updateAddress = async (
  formData: Partial<TAddress>,
  id: string
) => {
  const res = await axiosInstance.patch(`/address/${id}`, formData);

  return res.data;
};

export const deleteAddress = async (id: string) => {
  const res = await axiosInstance.delete(`/address/${id}`);

  return res.data;
};
