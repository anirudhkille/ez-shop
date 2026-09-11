import Category from "@/modules/category/category.model";

export const create = async (data: { name: string; slug: string; image: string }) => {
  return await Category.create(data);
};

export const findAll = async () => {
  return await Category.find().lean();
};

export const findById = async (id: string) => {
  return await Category.findById(id);
};

export const updateById = async (id: string, data: Partial<{ name: string; slug: string; image: string }>) => {
  return await Category.findByIdAndUpdate(id, data, { new: true });
};

export const deleteById = async (id: string) => {
  const category = await Category.findById(id);
  if (category) await category.deleteOne();
  return category;
};
