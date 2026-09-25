import { UpdateQuery } from "mongoose";
import * as addressRepository from "@/modules/address/address.repository";
import { IAddress } from "@/modules/address/address.model";

export const createAddress = async (
  userId: string,
  body: Partial<IAddress>,
) => {
  const address = await addressRepository.create({ ...body, user: userId });
  return address;
};

export const getAddressByUser = async (userId: string) => {
  const address = await addressRepository.findByUser(userId);
  return address;
};

export const updateAddress = async (
  id: string,
  userId: string,
  body: UpdateQuery<IAddress>,
) => {
  const address = await addressRepository.findByIdAndUpdate(id, userId, body);
  return address;
};

export const deleteAddress = async (id: string, userId: string) => {
  const address = await addressRepository.findByIdAndDelete(id, userId);
  return address;
};
