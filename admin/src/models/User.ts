import mongoose, { type Document } from "mongoose";

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  name?: string;
  email: string;
  phone?: string;
  googleId?: string;
  avatar?: string;
  role: string;
  isEmailVerified: boolean;
  isProfileCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new mongoose.Schema<IUser>(
  {
    name: { type: String },
    email: { type: String, required: true, unique: true },
    phone: { type: String },
    googleId: { type: String },
    avatar: { type: String },
    role: { type: String, default: "User" },
    isEmailVerified: { type: Boolean, default: false },
    isProfileCompleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const User =
  mongoose.models.User || mongoose.model<IUser>("User", userSchema);
export default User;
