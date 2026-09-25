import crypto from "crypto";
import nodemailer from "nodemailer";
import { AppError } from "@/utils/appError";
import { env } from "@/config/env.config";
import { resetPasswordTemplate } from "@/templates/resetEmailTemplate";
import {
  generateAccessToken,
  generateRefreshToken,
} from "@/utils/generateToken";
import * as adminRepository from "@/modules/admin/admin.repository";
import type { IAdmin } from "@/modules/admin/admin.model";

export const login = async (email: string, password: string) => {
  const user = await adminRepository.findByEmail(email);
  if (!user || !(await user.matchPassword(password))) {
    throw new AppError("Invalid credentials", 401);
  }

  const accessToken = generateAccessToken({
    _id: String(user._id),
    role: user.role,
  });
  const refreshToken = generateRefreshToken({
    _id: String(user._id),
    role: user.role,
  });

  user.refreshToken = refreshToken;
  await user.save();

  return {
    token: accessToken,
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    refreshToken,
  };
};

export const forgotPassword = async (email: string) => {
  const user = await adminRepository.findByEmail(email);
  if (!user) {
    throw new AppError("Admin with this email does not exist", 404);
  }

  const resetToken = user.generateResetToken();
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${env.ADMIN_URL}/reset-password?token=${resetToken}`;

  const transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    auth: {
      user: env.SMTP_EMAIL,
      pass: env.SMTP_PASSWORD,
    },
  });

  await transporter.sendMail({
    to: user.email,
    subject: "Password Reset Request",
    html: resetPasswordTemplate(user.name, resetUrl),
  });

  return { sent: true };
};

export const resetPassword = async (token: string, newPassword: string) => {
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  const user = await adminRepository.findOne({
    resetPasswordToken,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user) {
    throw new AppError("Invalid or expired reset token", 400);
  }

  user.password = newPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;

  const accessToken = generateAccessToken({
    _id: String(user._id),
    role: user.role,
  });
  const refreshToken = generateRefreshToken({
    _id: String(user._id),
    role: user.role,
  });
  user.refreshToken = refreshToken;

  await user.save();

  return {
    token: accessToken,
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    refreshToken,
  };
};

type AdminProfileUpdate = Partial<Pick<IAdmin, "name" | "phone">>;

export const editProfile = async (
  userId: string,
  updates: AdminProfileUpdate,
) => {
  const allowedFields = ["name", "phone"] as const;
  const sanitized: AdminProfileUpdate = {};

  for (const field of allowedFields) {
    if (updates[field] !== undefined) sanitized[field] = updates[field];
  }

  const user = await adminRepository.findByIdAndUpdate(userId, sanitized);

  if (!user) {
    throw new AppError("Admin not found", 404);
  }

  return user;
};

export const getProfile = async (userId: string) => {
  const user = await adminRepository.findById(userId, "-password");

  if (!user) {
    throw new AppError("Admin not found", 404);
  }

  return user;
};
