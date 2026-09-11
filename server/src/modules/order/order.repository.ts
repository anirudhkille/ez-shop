import Order from "@/modules/order/order.model";

export const create = async (data: any) => {
  return await Order.create(data);
};

export const find = async (skip: number, limit: number) => {
  return await Order.find().skip(skip).limit(limit);
};

export const countDocuments = async (filter?: any) => {
  return await Order.countDocuments(filter);
};

export const findByUser = async (userId: string, skip: number, limit: number) => {
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

export const findOnePopulated = async (filter: any) => {
  return await Order.findOne(filter).populate("products.product", "name image price slug");
};
