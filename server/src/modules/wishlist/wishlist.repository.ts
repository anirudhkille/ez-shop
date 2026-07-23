import Wishlist from "@/modules/wishlist/wishlist.model";

export const findOne = async (filter: any) => {
  return await Wishlist.findOne(filter);
};

export const findOneLean = async (filter: any) => {
  return await Wishlist.findOne(filter).lean();
};

export const findOnePopulated = async (filter: any) => {
  return await Wishlist.findOne(filter).populate("products").lean();
};

export const create = async (data: any) => {
  return await Wishlist.create(data);
};
