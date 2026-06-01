import mongoose, { type Document } from "mongoose";

export interface IOrder extends Document {
  _id: mongoose.Types.ObjectId;
  user?: mongoose.Types.ObjectId;
  name: string;
  email: string;
  phone: string;
  products: {
    product: mongoose.Types.ObjectId;
    quantity: number;
    price: number;
  }[];
  address: {
    name: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    phone: string;
  };
  deliveryMethod: "standard" | "express" | "same-day";
  subtotal: number;
  deliveryCharge: number;
  totalAmount: number;
  paymentStatus: "pending" | "paid" | "failed";
  paymentType: "cod" | "card";
  paymentIntentId?: string;
  sessionId?: string;
  orderStatus: "processing" | "shipped" | "delivered";
  createdAt: Date;
  updatedAt: Date;
}

const orderSchema = new mongoose.Schema<IOrder>(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    name: String,
    email: String,
    phone: String,
    products: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
      },
    ],
    address: {
      name: String,
      addressLine1: String,
      addressLine2: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
      phone: String,
    },
    deliveryMethod: {
      type: String,
      enum: ["standard", "express", "same-day"],
      default: "standard",
    },
    subtotal: Number,
    deliveryCharge: Number,
    totalAmount: Number,
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
    paymentType: {
      type: String,
      enum: ["cod", "card"],
      required: true,
    },
    paymentIntentId: String,
    sessionId: String,
    orderStatus: {
      type: String,
      enum: ["processing", "shipped", "delivered"],
      default: "processing",
    },
  },
  { timestamps: true }
);

const Order =
  mongoose.models.Order || mongoose.model<IOrder>("Order", orderSchema);
export default Order;
