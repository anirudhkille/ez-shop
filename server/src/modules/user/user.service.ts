import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {
  generateAccessToken,
  generateRefreshToken,
} from "@/utils/generateToken";
import { generateOtp } from "@/utils/generateOtp";
import { sendEmail } from "@/services/emailService";
import { resetPasswordTemplate } from "@/templates/resetEmailTemplate";
import { verifyEmailTemplate } from "@/templates/verifyEmailTemplate";
import Session from "@/models/Session";
import { AppError } from "@/utils/appError";
import * as userRepository from "@/modules/user/user.repository";

export const signUp = async (email: string, password: string) => {
  const userExists = await userRepository.findByEmail(email);
  if (userExists) {
    throw new AppError("Email already registered", 409);
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  const otp = generateOtp();

  await Session.create({
    key: `signup:${email}`,
    value: JSON.stringify({ email, password: hashedPassword, otp }),
    expiresAt: new Date(Date.now() + 10 * 60 * 1000),
  });

  await sendEmail({
    to: email,
    subject: "Verify Your Email",
    html: verifyEmailTemplate(email, otp),
  });

  return { message: "OTP sent to email" };
};

export const verifySignupOTP = async (email: string, otp: string) => {
  const session = await Session.findOne({ key: `signup:${email}` });

  if (!session) {
    throw new AppError("OTP expired", 400);
  }

  const data = JSON.parse(session.value) as {
    email: string;
    otp: string;
    password: string;
  };

  if (data.otp !== otp) {
    throw new AppError("Invalid OTP", 400);
  }

  const newUser = await userRepository.createUser({
    email: data.email,
    password: data.password,
    isEmailVerified: true,
  });

  await session.deleteOne();

  const accessToken = generateAccessToken({
    _id: String(newUser._id),
    role: newUser.role,
  });
  const refreshToken = generateRefreshToken({
    _id: String(newUser._id),
    role: newUser.role,
  });

  await Session.create({
    key: `refresh:${newUser._id}`,
    value: refreshToken,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  return {
    accessToken,
    refreshToken,
    user: {
      id: newUser._id,
      name: newUser.name,
      email: newUser.email,
    },
  };
};

export const login = async (email: string, password: string) => {
  const user = await userRepository.findByEmail(email);

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

  await Session.create({
    key: `refresh:${user._id}`,
    value: refreshToken,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  return {
    accessToken,
    refreshToken,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
};

export const forgotPassword = async (email: string) => {
  const user = await userRepository.findByEmail(email);

  if (!user) {
    throw new AppError("User not found", 404);
  }

  const otp = generateOtp();

  await Session.create({
    key: `reset:${email}`,
    value: otp,
    expiresAt: new Date(Date.now() + 10 * 60 * 1000),
  });

  await sendEmail({
    to: email,
    subject: "Reset Password - EZ Shop",
    html: resetPasswordTemplate(user.name || "User", otp),
  });

  return { message: "Reset OTP sent" };
};

export const resetPassword = async (
  email: string,
  otp: string,
  newPassword: string,
) => {
  const session = await Session.findOne({ key: `reset:${email}` });

  if (!session || session.value !== otp) {
    throw new AppError("Invalid or expired OTP", 400);
  }

  const user = await userRepository.findByEmail(email);

  if (!user) {
    throw new AppError("User not found", 404);
  }

  user.password = newPassword;
  await user.save();
  await session.deleteOne();

  return { message: "Password reset successful" };
};

export const completeProfile = async (
  userId: string,
  data: { name: string; phone: string },
) => {
  const user = await userRepository.findById(userId);

  if (!user) {
    throw new AppError("User not found", 404);
  }

  user.phone = data.phone;
  user.name = data.name;
  user.isProfileCompleted = true;
  await user.save();

  return { message: "Profile completed" };
};

export const getProfile = async (userId: string) => {
  const user = await userRepository.findById(userId, "-password");

  if (!user) {
    throw new AppError("User not found", 404);
  }

  return { user };
};

export const updatePassword = async (
  userId: string,
  currentPassword: string,
  newPassword: string,
) => {
  const user = await userRepository.findById(userId);

  if (!user) {
    throw new AppError("User not found", 404);
  }

  if (!user.password) {
    throw new AppError("Cannot change password for OAuth accounts", 400);
  }

  const isMatch = await user.matchPassword(currentPassword);
  if (!isMatch) {
    throw new AppError("Current password is incorrect", 400);
  }

  user.password = newPassword;
  await user.save();

  return { message: "Password updated successfully" };
};

export const updateProfile = async (
  userId: string,
  updates: Record<string, any>,
) => {
  const user = await userRepository.findByIdAndUpdate(userId, updates);

  if (!user) {
    throw new AppError("User not found", 404);
  }

  return { user };
};

export const refreshToken = async (token: string) => {
  if (!token) {
    throw new AppError("No refresh token", 401);
  }

  let decoded: any;
  try {
    decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET!);
  } catch {
    throw new AppError("Invalid refresh token", 403);
  }

  const session = await Session.findOne({ key: `refresh:${decoded._id}` });

  if (!session || session.value !== token) {
    throw new AppError("Refresh token mismatch", 403);
  }

  const newRefreshToken = generateRefreshToken(decoded);
  const newAccessToken = generateAccessToken(decoded);

  session.value = newRefreshToken;
  session.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await session.save();

  return { accessToken: newAccessToken, refreshToken: newRefreshToken };
};

export const logout = async (token: string) => {
  if (token) {
    try {
      const decoded: any = jwt.verify(token, process.env.JWT_REFRESH_SECRET!);
      await Session.findOneAndDelete({ key: `refresh:${decoded.id}` });
    } catch {
      // ignore
    }
  }

  return { message: "Logged out successfully" };
};

export const googleLogin = async (
  googleUser: {
    email?: string;
    name?: string;
    googleId: string;
    avatar?: string;
  },
) => {
  if (!googleUser || !googleUser.email) {
    throw new AppError("Invalid Google user data", 400);
  }

  let user = await userRepository.findByEmail(googleUser.email);

  if (!user) {
    user = await userRepository.createUser({
      name: googleUser.name,
      email: googleUser.email,
      googleId: googleUser.googleId,
      avatar: googleUser.avatar,
    });
  }

  const accessToken = generateAccessToken({
    _id: String(user._id),
    role: user.role,
  });
  const refreshToken = generateRefreshToken({
    _id: String(user._id),
    role: user.role,
  });

  await Session.create({
    key: `refresh:${user._id}`,
    value: refreshToken,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  return { accessToken, refreshToken, user };
};
