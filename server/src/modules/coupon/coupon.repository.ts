import { FilterQuery } from "mongoose";

import Coupon, { ICoupon } from "@/modules/coupon/coupon.model";

export const create = async (data: Partial<ICoupon>) => {
  return await Coupon.create(data);
};

export const findAll = async (skip = 0, limit = 10, search?: string) => {
  const filter: FilterQuery<ICoupon> = {};

  if (search) {
    filter.code = { $regex: search, $options: "i" };
  }

  return await Coupon.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();
};

export const countDocuments = async (search?: string) => {
  const filter: FilterQuery<ICoupon> = {};

  if (search) {
    filter.code = { $regex: search, $options: "i" };
  }

  return await Coupon.countDocuments(filter);
};

export const findById = async (id: string) => {
  return await Coupon.findById(id);
};

export const findByCode = async (code: string) => {
  return await Coupon.findOne({ code: code.trim().toUpperCase() });
};

export const updateById = async (id: string, data: Partial<ICoupon>) => {
  return await Coupon.findByIdAndUpdate(id, data, { new: true });
};

export const deleteById = async (id: string) => {
  return await Coupon.findByIdAndDelete(id);
};

/** Atomically claims one use so concurrent checkouts cannot oversell maxUses. */
export const claimUse = async (id: string) => {
  return await Coupon.findOneAndUpdate(
    {
      _id: id,
      $or: [
        { maxUses: { $exists: false } },
        { maxUses: null },
        { $expr: { $lt: ["$usedCount", "$maxUses"] } },
      ],
    },
    { $inc: { usedCount: 1 } },
    { new: true },
  );
};

export const releaseUse = async (id: string) => {
  return await Coupon.findOneAndUpdate(
    { _id: id, usedCount: { $gt: 0 } },
    { $inc: { usedCount: -1 } },
    { new: true },
  );
};
