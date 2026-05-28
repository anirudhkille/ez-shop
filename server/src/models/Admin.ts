import mongoose, { Document } from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";

export interface IAdmin extends Document {
  name: string;
  email: string;
  phone?: string;
  password: string;
  role: string;
  refreshToken?: string | null;
  resetPasswordToken?: string | null;
  resetPasswordExpires?: Date | null;
  matchPassword(password: string): Promise<boolean>;
  generateResetToken(): string;
}

const adminSchema = new mongoose.Schema<IAdmin>(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    phone: {
      type: String,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      default: "User",
    },
    refreshToken: { type: String },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
  },
  { timestamps: true },
);

adminSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

adminSchema.methods.matchPassword = async function (enteredPassword: string) {
  return await bcrypt.compare(enteredPassword, this.password);
};

adminSchema.methods.generateResetToken = function () {
  const token = crypto.randomBytes(20).toString("hex");

  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  this.resetPasswordExpires = Date.now() + 10 * 60 * 1000;

  return token;
};

const Admin = mongoose.model<IAdmin>("Admin", adminSchema);
export default Admin;
