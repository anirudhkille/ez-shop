import Admin, { type IAdmin } from "@/modules/admin/admin.model";
import type { FilterQuery, UpdateQuery } from "mongoose";

export const findByEmail = async (email: string) => {
  return await Admin.findOne({ email });
};

export const findById = async (id: string, select?: string) => {
  const query = Admin.findById(id);
  if (select) query.select(select);
  return await query;
};

export const findByIdAndUpdate = async (
  id: string,
  data: UpdateQuery<IAdmin>,
) => {
  return await Admin.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
};

export const findOne = async (filter: FilterQuery<IAdmin>) => {
  return await Admin.findOne(filter);
};
