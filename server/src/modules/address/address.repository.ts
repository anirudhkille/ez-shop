import Address from "@/modules/address/address.model";

export const create = async (data: any) => {
  return await Address.create(data);
};

export const findByUser = async (userId: string) => {
  return await Address.find({ user: userId });
};

export const findByIdAndUpdate = async (id: string, userId: string, data: any) => {
  return await Address.findByIdAndUpdate({ _id: id, user: userId }, data, { new: true });
};

export const findByIdAndDelete = async (id: string, userId: string) => {
  return await Address.findByIdAndDelete({ _id: id, user: userId });
};
