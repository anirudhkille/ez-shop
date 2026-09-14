import type { UpdateQuery } from "mongoose";
import User, { type IUser } from "@/modules/user/user.model";

export const findByEmail = async (email: string) => {
  return await User.findOne({ email });
};

export const createUser = async (data: Partial<IUser>) => {
  return await User.create(data);
};

export const findById = async (id: string, select?: string) => {
  const query = User.findById(id);
  if (select) query.select(select);
  return await query;
};

export const findByIdAndUpdate = async (
  id: string,
  updates: UpdateQuery<IUser>,
) => {
  return await User.findByIdAndUpdate(id, updates, {
    new: true,
    runValidators: true,
  });
};
