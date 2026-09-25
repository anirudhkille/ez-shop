import jwt, { type JwtPayload } from "jsonwebtoken";
import { env } from "@/config/env.config";
import {
  generateAccessToken,
  generateRefreshToken,
} from "@/utils/generateToken";
import { generateOtp } from "@/utils/generateOtp";
import {
  createResetToken,
  RESET_TOKEN_TTL_MS,
  resetSessionKey,
} from "@/utils/passwordReset";
import { sendEmail } from "@/services/emailService";
import { resetPasswordTemplate } from "@/templates/resetEmailTemplate";
import { verifyEmailTemplate } from "@/templates/verifyEmailTemplate";
import Session from "./session..model";
import { AppError } from "@/utils/appError";
import * as userRepository from "@/modules/user/user.repository";
import type { IUser } from "@/modules/user/user.model";

const REFRESH_TTL_MS = 7 * 24 * 60 * 60 * 1000;

const saveRefreshSession = async (userId: string, refreshToken: string) => {
  await Session.findOneAndUpdate(
    { key: `refresh:${userId}` },
    {
      value: refreshToken,
      expiresAt: new Date(Date.now() + REFRESH_TTL_MS),
    },
    { upsert: true, new: true },
  );
};

export const signUp = async (email: string, password: string) => {
  const userExists = await userRepository.findByEmail(email);
  if (userExists) {
    throw new AppError("Email already registered", 409);
  }

  const otp = generateOtp();

  await Session.create({
    key: `signup:${email}`,
    value: JSON.stringify({ email, password, otp }),
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

  await saveRefreshSession(String(newUser._id), refreshToken);

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

  await saveRefreshSession(String(user._id), refreshToken);

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

const genericResetMessage =
  "If an account exists, a password reset link has been sent.";

export const forgotPassword = async (email: string) => {
  const user = await userRepository.findByEmail(email);

  if (!user) {
    return { message: genericResetMessage };
  }

  const token = createResetToken();
  const sessionKey = resetSessionKey(token);

  await Session.create({
    key: sessionKey,
    value: String(user._id),
    expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS),
  });

  const resetUrl = `${env.CLIENT_URL}/reset-password?token=${encodeURIComponent(token)}`;

  await sendEmail({
    to: user.email,
    subject: "Reset your EZ Shop password",
    html: resetPasswordTemplate(user.name || "User", resetUrl),
  });

  return { message: genericResetMessage };
};

export const resetPassword = async (token: string, newPassword: string) => {
  const sessionKey = resetSessionKey(token);
  const session = await Session.findOneAndDelete({
    key: sessionKey,
    expiresAt: { $gt: new Date() },
  });

  if (!session) {
    throw new AppError("Invalid or expired reset token", 400);
  }

  const user = await userRepository.findById(String(session.value));

  if (!user) {
    throw new AppError("User not found", 404);
  }

  user.password = newPassword;
  await user.save();

  await Session.deleteOne({ key: `refresh:${user._id}` });

  return { message: "Password reset successful" };
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

type ProfileUpdateInput = Partial<Pick<IUser, "name" | "phone" | "avatar">>;

export const updateProfile = async (
  userId: string,
  updates: ProfileUpdateInput,
) => {
  const allowedFields = ["name", "phone", "avatar"] as const;
  const sanitized: ProfileUpdateInput = {};

  for (const field of allowedFields) {
    if (updates[field] !== undefined) sanitized[field] = updates[field];
  }

  const user = await userRepository.findByIdAndUpdate(userId, sanitized);

  if (!user) {
    throw new AppError("User not found", 404);
  }

  return { user };
};

export const refreshToken = async (token: string) => {
  if (!token) {
    throw new AppError("No refresh token", 401);
  }

  let decoded: JwtPayload;
  try {
    decoded = jwt.verify(token, env.JWT_REFRESH_SECRET) as JwtPayload;
  } catch {
    throw new AppError("Invalid refresh token", 403);
  }

  const userId = String(decoded._id);
  const newRefreshToken = generateRefreshToken(
    decoded as unknown as { _id: string; role: string },
  );
  const newAccessToken = generateAccessToken(
    decoded as unknown as { _id: string; role: string },
  );

  const session = await Session.findOneAndUpdate(
    {
      key: `refresh:${userId}`,
      value: token,
      expiresAt: { $gt: new Date() },
    },
    {
      value: newRefreshToken,
      expiresAt: new Date(Date.now() + REFRESH_TTL_MS),
    },
    { new: true },
  );

  if (!session) {
    throw new AppError("Refresh token mismatch", 403);
  }

  return { accessToken: newAccessToken, refreshToken: newRefreshToken };
};

export const logout = async (token: string) => {
  if (token) {
    try {
      const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET) as JwtPayload;
      await Session.findOneAndDelete({ key: `refresh:${decoded._id}` });
    } catch {
      // ignore
    }
  }

  return { message: "Logged out successfully" };
};

export const getAllUsers = async (page = 1, limit = 10) => {
  const skip = (page - 1) * limit;

  const [users, total] = await Promise.all([
    userRepository.findAll(skip, limit, "-password"),
    userRepository.countDocuments(),
  ]);

  return {
    users,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getUserById = async (id: string) => {
  const user = await userRepository.findById(id, "-password");

  if (!user) {
    throw new AppError("User not found", 404);
  }

  return { user };
};

export const deleteUserById = async (id: string) => {
  const user = await userRepository.deleteById(id);

  if (!user) {
    throw new AppError("User not found", 404);
  }

  return { message: "User deleted successfully" };
};

export const googleLogin = async (googleUser: {
  email?: string;
  name?: string;
  googleId: string;
  avatar?: string;
}) => {
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

  await saveRefreshSession(String(user._id), refreshToken);

  return { accessToken, refreshToken, user };
};
