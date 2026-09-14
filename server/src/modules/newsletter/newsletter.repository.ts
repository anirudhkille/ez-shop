import { FilterQuery } from "mongoose";
import Newsletter, { INewsletter } from "@/modules/newsletter/newsletter.model";

export const findOne = async (filter: FilterQuery<INewsletter>) => {
  return await Newsletter.findOne(filter).lean();
};

export const create = async (data: Partial<INewsletter>) => {
  return await Newsletter.create(data);
};

export const find = async (skip: number, limit: number) => {
  return await Newsletter.find().skip(skip).limit(limit).lean();
};

export const countDocuments = async () => {
  return await Newsletter.countDocuments();
};
