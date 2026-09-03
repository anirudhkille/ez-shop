import crypto from "crypto";
import nodemailer from "nodemailer";
import { resetPasswordTemplate } from "@/templates/resetEmailTemplate";
import {
  generateAccessToken,
  generateRefreshToken,
} from "@/utils/generateToken";
import * as adminRepository from "@/modules/admin/admin.repository";

export const signUp = async (body: any) => {
  const { name, email, password } = body;

  const userExists = await adminRepository.findByEmail(email);
  if (userExists) {
    return { status: 409, data: { success: false, message: "Email already registered" } };
  }

  const newUser = await adminRepository.create({ name, email, password, role: "Admin" });

  const accessToken = generateAccessToken({
    _id: String(newUser._id),
    role: newUser.role,
  });
  const refreshToken = generateRefreshToken({
    _id: String(newUser._id),
    role: newUser.role,
  });

  newUser.refreshToken = refreshToken;
  await newUser.save();

  return {
    status: 201,
    data: {
      success: true,
      message: "User registered successfully",
      data: {
        id: newUser._id,
        token: accessToken,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
      refreshToken,
    },
  };
};

export const login = async (email: string, password: string) => {
  const user = await adminRepository.findByEmail(email);
  if (!user || !(await user.matchPassword(password))) {
    return { status: 401, data: { success: false, message: "Invalid credentials" } };
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
    status: 200,
    data: {
      success: true,
      message: "Login successful",
      data: {
        token: accessToken,
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      refreshToken,
    },
  };
};

export const forgotPassword = async (email: string) => {
  const user = await adminRepository.findByEmail(email);
  if (!user) {
    return { status: 404, data: { success: false, message: "Admin with this email does not exist" } };
  }

  const resetToken = user.generateResetToken();
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${process.env.ADMIN_URL}/reset-password?token=${resetToken}`;

  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  await transporter.sendMail({
    to: user.email,
    subject: "Password Reset Request",
    html: resetPasswordTemplate(user.name, resetUrl),
  });

  return { status: 200, data: { success: true, message: "Password reset link sent to email" } };
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
    return { status: 400, data: { success: false, message: "Invalid or expired reset token" } };
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
    status: 200,
    data: {
      success: true,
      message: "Password reset successful",
      data: {
        token: accessToken,
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      refreshToken,
    },
  };
};

export const editProfile = async (userId: string, updates: any) => {
  const allowedFields = ["name", "phone"];
  const sanitized: any = {};

  for (const field of allowedFields) {
    if (updates[field] !== undefined) sanitized[field] = updates[field];
  }

  const user = await adminRepository.findByIdAndUpdate(userId, sanitized);

  if (!user) {
    return { status: 404, data: { success: false, message: "Admin not found" } };
  }

  return { status: 200, data: { success: true, message: "Profile updated successfully", user } };
};

export const getProfile = async (userId: string) => {
  const user = await adminRepository.findById(userId, "-password");

  if (!user) {
    return { status: 404, data: { success: false, message: "Admin not found" } };
  }

  return { status: 200, data: { success: true, user } };
};
