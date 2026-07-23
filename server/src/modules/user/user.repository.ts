import User from "@/modules/user/user.model";

export const findByEmail = async (email: string) => {
  return await User.findOne({ email });
};

export const createUser = async (data: Record<string, any>) => {
  return await User.create(data);
};

export const findById = async (id: string, select?: string) => {
  const query = User.findById(id);
  if (select) query.select(select);
  return await query;
};

export const findByIdAndUpdate = async (
  id: string,
  updates: Record<string, any>,
) => {
  return await User.findByIdAndUpdate(id, updates, {
    new: true,
    runValidators: true,
  });
};
