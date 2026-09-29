import Review, {
  IReview,
  ReviewWithAuthor,
} from "@/modules/review/review.model";
import { Types, UpdateQuery } from "mongoose";

export const create = async (data: {
  product?: string | Types.ObjectId;
  rating?: number;
  comment?: string;
  user?: string | Types.ObjectId;
}) => {
  const review = new Review(data);
  return await review.save();
};

export const upsertForUser = async (
  userId: string,
  data: { product: string; rating: number; comment?: string },
) => {
  return await Review.findOneAndUpdate(
    { product: data.product, user: userId },
    { $set: { rating: data.rating, comment: data.comment } },
    { upsert: true, new: true },
  );
};

export const findByProduct = async (
  productId: string,
  skip: number,
  limit: number,
) => {
  return await Review.find({ product: productId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate("user", "name");
};

export const countByProduct = async (productId: string) => {
  return await Review.countDocuments({ product: productId });
};

export const summaryFor = async (productId: string) => {
  const [row] = await Review.aggregate<{ average: number; count: number }>([
    { $match: { product: new Types.ObjectId(String(productId)) } },
    { $group: { _id: null, average: { $avg: "$rating" }, count: { $sum: 1 } } },
  ]);

  return {
    rating: row ? Math.round(row.average * 100) / 100 : 0,
    reviewsCount: row?.count ?? 0,
  };
};

export const findOwnedById = async (
  id: string | Types.ObjectId,
  userId: string,
) => {
  return (await Review.findOne({ _id: id, user: userId }).populate(
    "user",
    "name",
  )) as ReviewWithAuthor | null;
};

export const findOwnedByProductAndUser = async (
  productId: string,
  userId: string,
) => {
  return (await Review.findOne({ product: productId, user: userId }).populate(
    "user",
    "name",
  )) as ReviewWithAuthor | null;
};

export const findByIdAndUpdate = async (
  id: string | Types.ObjectId,
  userId: string,
  data: UpdateQuery<IReview>,
) => {
  return await Review.findByIdAndUpdate({ _id: id, user: userId }, data, {
    new: true,
  }).populate("user", "name");
};

export const findByIdAndDelete = async (id: string, userId: string) => {
  return await Review.findByIdAndDelete({ _id: id, user: userId }).populate(
    "user",
    "name",
  );
};
