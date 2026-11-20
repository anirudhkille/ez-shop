import mongoose from "mongoose";

export interface IWishlist {
  user: mongoose.Types.ObjectId | string;
  products: (mongoose.Types.ObjectId | string)[];
}

const wishlistSchema = new mongoose.Schema<IWishlist>({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  products: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
  ],
});

const Wishlist = mongoose.model<IWishlist>("Wishlist", wishlistSchema);
export default Wishlist;
