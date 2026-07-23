import Address from "@/modules/address/address.model";

export const create = async (data: any) => {
  return await Address.create(data);
};

export const findByUser = async (userId: string) => {
  return await Address.find({ user: userId });
};

export const findByIdAndUpdate = async (id: string, data: any) => {
  return await Address.findByIdAndUpdate(id, data, { new: true });
};

export const findByIdAndDelete = async (id: string) => {
  return await Address.findByIdAndDelete(id);
};
