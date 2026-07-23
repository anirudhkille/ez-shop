import * as addressRepository from "@/modules/address/address.repository";

export const createAddress = async (userId: string, body: any) => {
  const address = await addressRepository.create({ ...body, user: userId });
  return { address, message: "Address created successfully" };
};

export const getAddressByUser = async (userId: string) => {
  const address = await addressRepository.findByUser(userId);
  return { address, message: "Address fetched successfully" };
};

export const updateAddress = async (id: string, body: any) => {
  const address = await addressRepository.findByIdAndUpdate(id, body);
  return { address, message: "Address updated successfully" };
};

export const deleteAddress = async (id: string) => {
  const address = await addressRepository.findByIdAndDelete(id);
  return { address, message: "Address deleted successfully" };
};
