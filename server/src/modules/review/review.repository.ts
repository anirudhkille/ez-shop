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

/**
 * An absent comment is unset rather than skipped. Mongoose strips undefined
 * keys from $set, so omitting it would silently leave the reviewer's previous
 * comment attached to a new rating.
 */
export const reviewUpdate = (data: {
  rating?: number;
  comment?: string;
}): UpdateQuery<IReview> => {
  const update: UpdateQuery<IReview> = { $set: {} };

  if (data.rating !== undefined) update.$set!.rating = data.rating;

  if (data.comment) {
    update.$set!.comment = data.comment;
  } else {
    update.$unset = { comment: 1 };
  }

  return update;
};

export const upsertForUser = async (
  userId: string,
  data: { product: string; rating: number; comment?: string },
) => {
  return await Review.findOneAndUpdate(
    { product: data.product, user: userId },
    reviewUpdate(data),
    { upsert: true, new: true },
  ).populate("user", "name");
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
  data: { rating?: number; comment?: string },
) => {
  return await Review.findByIdAndUpdate(
    { _id: id, user: userId },
    reviewUpdate(data),
    { new: true },
  ).populate("user", "name");
};

export const findByIdAndDelete = async (id: string, userId: string) => {
  return await Review.findByIdAndDelete({ _id: id, user: userId }).populate(
    "user",
    "name",
  );
};
