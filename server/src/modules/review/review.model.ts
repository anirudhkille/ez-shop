import mongoose from "mongoose";

export interface IReview {
  product: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  rating: number;
  comment?: string;
}

const reviewSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: String,
  },
  { timestamps: true },
);

reviewSchema.index({ product: 1, user: 1 }, { unique: true });

export type ReviewWithAuthor = IReview & {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  user: { _id: mongoose.Types.ObjectId; name?: string };
};

const Review = mongoose.model("Review", reviewSchema);
export default Review;
