import Cart from "@/modules/cart/cart.model";

export const findOne = async (filter: any) => {
  return await Cart.findOne(filter);
};

export const findOnePopulated = async (filter: any) => {
  return await Cart.findOne(filter).populate(
    "products.product",
    "name image price discountPrice variants publish slug",
  );
};

export const findOneWithProductPopulated = async (filter: any) => {
  return await Cart.findOne(filter).populate("products.product");
};

export const create = async (data: any) => {
  return await Cart.create(data);
};

export const findOneAndUpdate = async (filter: any, data: any) => {
  return await Cart.findOneAndUpdate(filter, data);
};
