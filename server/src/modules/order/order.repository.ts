import Order, { IOrder } from "@/modules/order/order.model";
import { FilterQuery } from "mongoose";

export const create = async (data: Partial<IOrder>) => {
  return await Order.create(data);
};

export const find = async (skip: number, limit: number) => {
  return await Order.find().skip(skip).limit(limit);
};

export const countDocuments = async (filter?: FilterQuery<IOrder>) => {
  return await Order.countDocuments(filter);
};

export const findByUser = async (
  userId: string,
  skip: number,
  limit: number,
) => {
  return await Order.find({ user: userId }).skip(skip).limit(limit);
};

export const countByUser = async (userId: string) => {
  return await Order.countDocuments({ user: userId });
};

export const findByIdPopulated = async (id: string) => {
  return await Order.findById(id).populate(
    "products.product",
    "name image price slug",
  );
};

export const findOnePopulated = async (filter: FilterQuery<IOrder>) => {
  return await Order.findOne(filter).populate(
    "products.product",
    "name image price slug",
  );
};

export const findByIdAndUpdate = async (
  id: string,
  updates: Partial<IOrder>,
) => {
  return await Order.findByIdAndUpdate(id, updates, { new: true });
};

export const deleteById = async (id: string) => {
  return await Order.findByIdAndDelete(id);
};
