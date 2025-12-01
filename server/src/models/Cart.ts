import mongoose, { Schema, Document } from "mongoose";

export interface ICartProduct {
  _id: mongoose.Types.ObjectId;
  product: mongoose.Types.ObjectId;
  variantId?: mongoose.Types.ObjectId;
  size?: string;
  quantity: number;
  priceAtPurchase: number;
  discountPriceAtPurchase?: number;
}

export interface ICart extends Document {
  user: mongoose.Types.ObjectId;
  products: mongoose.Types.DocumentArray<ICartProduct>;
}

const cartProductSchema = new Schema<ICartProduct>({
  product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  variantId: Schema.Types.ObjectId,
  size: String,
  quantity: { type: Number, default: 1, min: 1, max: 10 },
  priceAtPurchase: Number,
  discountPriceAtPurchase: Number,
});

const cartSchema = new Schema<ICart>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    products: {
      type: [cartProductSchema],
      default: [],
    },
  },
  { timestamps: true }
);

export const Cart = mongoose.model<ICart>("Cart", cartSchema);
export default Cart;
