import mongoose, { Types } from "mongoose";

export interface IAddress extends Document {
  user: Types.ObjectId;
  label: "Home" | "Work" | "Other";
  name: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  zipCode: string;
  state: string;
  city: string;
  country: string;
  isDefault: boolean;
}

const addressSchema = new mongoose.Schema<IAddress>(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    label: {
      type: String,
      enum: ["Home", "Work", "Other"],
      default: "Home",
    },
    name: { type: String, required: true },
    phone: { type: String, required: true },
    addressLine1: { type: String, required: true },
    addressLine2: { type: String, required: true },
    zipCode: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    country: { type: String, required: true },
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Address = mongoose.model("Address", addressSchema);
export default Address;
