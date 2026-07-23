import Newsletter from "@/modules/newsletter/newsletter.model";

export const findOne = async (filter: any) => {
  return await Newsletter.findOne(filter).lean();
};

export const create = async (data: any) => {
  return await Newsletter.create(data);
};

export const find = async (skip: number, limit: number) => {
  return await Newsletter.find().skip(skip).limit(limit).lean();
};

export const countDocuments = async () => {
  return await Newsletter.countDocuments();
};
