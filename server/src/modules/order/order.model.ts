import mongoose from "mongoose";

export interface IOrderProduct {
  product: mongoose.Types.ObjectId | string;
  quantity: number;
  price: number;
  variantId?: string;
  size?: string;
}

export interface IOrder {
  user?: mongoose.Types.ObjectId | string | null;
  name?: string;
  email?: string;
  phone?: string;
  products: IOrderProduct[];
  address?: {
    name: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    phone: string;
  };
  deliveryMethod?: string;
  subtotal?: number;
  discount?: number;
  coupon?: {
    code: string;
    type: string;
    discount: number;
  };
  deliveryCharge?: number;
  totalAmount?: number;
  paymentStatus?: string;
  paymentType?: string;
  paymentIntentId?: string;
  sessionId?: string;
  orderStatus?: string;
}

const orderSchema = new mongoose.Schema(
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
    discount: Number,
    coupon: {
      code: String,
      type: String,
      discount: Number,
    },
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
  { timestamps: true },
);

export default mongoose.model("Order", orderSchema);
