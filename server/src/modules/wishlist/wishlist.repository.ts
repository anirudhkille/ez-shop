import { FilterQuery } from "mongoose";
import Wishlist, { IWishlist } from "@/modules/wishlist/wishlist.model";

export const findOne = async (filter: FilterQuery<IWishlist>) => {
  return await Wishlist.findOne(filter);
};

export const findOneLean = async (filter: FilterQuery<IWishlist>) => {
  return await Wishlist.findOne(filter).lean();
};

export const findOnePopulated = async (filter: FilterQuery<IWishlist>) => {
  return await Wishlist.findOne(filter).populate("products").lean();
};

export const create = async (data: Partial<IWishlist>) => {
  return await Wishlist.create(data);
};
