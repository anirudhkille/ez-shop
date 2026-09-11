import Admin from "@/modules/admin/admin.model";

export const findByEmail = async (email: string) => {
  return await Admin.findOne({ email });
};

export const findById = async (id: string, select?: string) => {
  const query = Admin.findById(id);
  if (select) query.select(select);
  return await query;
};

export const findByIdAndUpdate = async (id: string, data: any) => {
  return await Admin.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
};

export const findOne = async (filter: any) => {
  return await Admin.findOne(filter);
};
