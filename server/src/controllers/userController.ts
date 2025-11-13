import User from "../models/User";
import crypto from "crypto";
import nodemailer from "nodemailer";
import { asyncHandler } from "../middlewares/asyncHandler";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/generateToken";
import { Request, Response } from "express";
import { resetPasswordTemplate } from "../utils/resetEmailTemplate";
import { refreshCookieOptions } from "../utils/cookies";

export const signUp = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res
      .status(400)
      .json({ success: false, message: "All fields are required" });
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    return res
      .status(409)
      .json({ success: false, message: "Email already registered" });
  }

  const newUser = await User.create({ name, email, password });

  const accessToken = generateAccessToken(newUser);
  const refreshToken = generateRefreshToken(newUser);

  newUser.refreshToken = refreshToken;
  await newUser.save();

  res
    .cookie("refreshToken", refreshToken, refreshCookieOptions())
    .status(201)
    .json({
      success: true,
      message: "User registered successfully",
      data: {
        id: newUser._id,
        token: accessToken,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ success: false, message: "All fields are required" });
  }

  const user = await User.findOne({ email });
  if (!user || !(await user.matchPassword(password))) {
    return res
      .status(401)
      .json({ success: false, message: "Invalid credentials" });
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  user.refreshToken = refreshToken;
  await user.save();

  res
    .cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.node_env === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    })
    .status(200)
    .json({
      success: true,
      message: "Login successful",
      data: {
        token: accessToken,
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
});

export const forgotPassword = asyncHandler(
  async (req: Request, res: Response) => {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User with this email does not exist",
      });
    }

    const resetToken = user.generateResetToken();
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

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

    res.status(200).json({
      success: true,
      message: "Password reset link sent to email",
    });
  }
);

export const resetPassword = asyncHandler(
  async (req: Request, res: Response) => {
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token",
      });
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    user.refreshToken = refreshToken;

    await user.save();

    res
      .cookie("refreshToken", refreshToken, refreshCookieOptions())
      .status(200)
      .json({
        success: true,
        message: "Password reset successful",
        data: {
          token: accessToken,
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
  }
);

export const getProfile = asyncHandler(async (req: any, res: Response) => {
  const user = await User.findById(req.user._id).select("-password");

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  res.status(200).json({
    success: true,
    user,
  });
});

export const updateProfile = asyncHandler(async (req: any, res: Response) => {
  const { _id } = req.user;
  const updates = req.body;
  const user = await User.findByIdAndUpdate(_id, updates, {
    new: true,
    runValidators: true,
  });

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  res.status(200).json({
    success: true,
    message: "Profile updated successfully",
    data: user,
  });
});

export const refreshToken = asyncHandler(
  async (req: Request, res: Response) => {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken)
      return res
        .status(401)
        .json({ success: false, message: "No refresh token" });

    const user = await User.findOne({ refreshToken: refreshToken });

    if (!user)
      return res
        .status(403)
        .json({ success: false, message: "Invalid refresh token" });

    const accessToken = generateAccessToken(user);

    res.status(200).json({
      success: true,
      message: "Access token generated successfully",
      token: accessToken,
    });
  }
);

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const token = req.cookies.refreshToken;
  if (!token) return res.sendStatus(204);

  const user = await User.findOne({ refreshToken: token });
  if (user) {
    user.refreshToken = null;
    await user.save();
  }

  res.clearCookie("refreshToken", { ...refreshCookieOptions(), maxAge: 0 });

  res.status(200).json({ success: true, message: "Logged out successfully" });
});

export const googleLogin = asyncHandler(async (req: Request, res: Response) => {
  const googleUser = req.user as {
    email?: string;
    name?: string;
    googleId: string;
    avatar?: string;
  };

  if (!googleUser || !googleUser.email) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid Google user data" });
  }

  let user = await User.findOne({ email: googleUser.email });

  if (!user) {
    user = await User.create({
      name: googleUser.name,
      email: googleUser.email,

      googleId: googleUser.googleId,
      avatar: googleUser.avatar,
    });
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  user.refreshToken = refreshToken;
  await user.save();

  res
    .cookie("refreshToken", refreshToken, refreshCookieOptions())
    .status(200)
    .json({
      success: true,
      message: "Google login successful",
      data: {
        id: user._id,
        token: accessToken,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
});
