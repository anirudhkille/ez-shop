import Review from "@/modules/review/review.model";

export const create = async (data: any) => {
  const review = new Review(data);
  return await review.save();
};

export const findByProduct = async (productId: string, skip: number, limit: number) => {
  return await Review.find({ product: productId }).skip(skip).limit(limit);
};

export const countByProduct = async (productId: string) => {
  return await Review.countDocuments({ product: productId });
};

export const findByIdAndUpdate = async (id: string, data: any) => {
  return await Review.findByIdAndUpdate(id, data, { new: true });
};

export const findByIdAndDelete = async (id: string) => {
  return await Review.findByIdAndDelete(id);
};
