import Cart, { ICart, ICartProduct } from "@/modules/cart/cart.model";
import { Types, UpdateQuery } from "mongoose";

export const findOne = async (filter: { user?: string }) => {
  return await Cart.findOne(filter);
};

export const findOnePopulated = async (filter: { user?: string }) => {
  return await Cart.findOne(filter).populate(
    "products.product",
    "name image price discountPrice variants publish slug",
  );
};

export const findOneWithProductPopulated = async (filter: {
  user?: string;
}) => {
  return await Cart.findOne(filter).populate("products.product");
};

export const create = async (data: {
  user?: string | Types.ObjectId;
  products?: ICartProduct[];
}) => {
  return await Cart.create(data);
};

export const findOneAndUpdate = async (
  filter: { user?: string },
  data: UpdateQuery<ICart>,
) => {
  return await Cart.findOneAndUpdate(filter, data);
};
