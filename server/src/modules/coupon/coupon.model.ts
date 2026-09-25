import mongoose from "mongoose";
import { Document } from "mongoose";

export type CouponType = "percentage" | "fixed";

export interface ICoupon extends Document {
  code: string;
  type: CouponType;
  value: number;
  description?: string;
  minOrderValue?: number;
  maxDiscountAmount?: number;
  maxUses?: number;
  usedCount: number;
  maxUsesPerUser?: number;
  expiresAt?: Date;
  active: boolean;
}

const couponSchema = new mongoose.Schema<ICoupon>(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["percentage", "fixed"],
      required: true,
    },
    value: {
      type: Number,
      required: true,
      min: 0,
    },
    description: {
      type: String,
      trim: true,
    },
    minOrderValue: {
      type: Number,
      min: 0,
      default: 0,
    },
    maxDiscountAmount: {
      type: Number,
      min: 0,
    },
    maxUses: {
      type: Number,
      min: 1,
    },
    usedCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    maxUsesPerUser: {
      type: Number,
      min: 1,
    },
    expiresAt: {
      type: Date,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

const Coupon = mongoose.model<ICoupon>("Coupon", couponSchema);
export default Coupon;
