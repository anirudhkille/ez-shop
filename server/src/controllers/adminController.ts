import Admin from "../models/Admin";
import crypto from "crypto";
import nodemailer from "nodemailer";
import { resetPasswordTemplate } from "../templates/resetEmailTemplate";
import { asyncHandler } from "../middlewares/asyncHandler";
import { Request, Response } from "express";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/generateToken";
import { Types } from "mongoose";

export const signUp = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res
      .status(400)
      .json({ success: false, message: "All fields are required" });
  }

  const userExists = await Admin.findOne({ email });
  if (userExists) {
    return res
      .status(409)
      .json({ success: false, message: "Email already registered" });
  }

  const newUser = await Admin.create({ name, email, password });

  const accessToken = generateAccessToken({
    _id: newUser._id as Types.ObjectId,
    role: newUser.role,
  });
  const refreshToken = generateRefreshToken({
    _id: newUser._id as Types.ObjectId,
    role: newUser.role,
  });

  newUser.refreshToken = refreshToken;
  await newUser.save();

  res
    .cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })
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

  const user = await Admin.findOne({ email });
  if (!user || !(await user.matchPassword(password))) {
    return res
      .status(401)
      .json({ success: false, message: "Invalid credentials" });
  }

  const accessToken = generateAccessToken({
    _id: user._id as Types.ObjectId,
    role: user.role,
  });
  const refreshToken = generateRefreshToken({
    _id: user._id as Types.ObjectId,
    role: user.role,
  });

  user.refreshToken = refreshToken;
  await user.save();

  res
    .cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
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

    const user = await Admin.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Admin with this email does not exist",
      });
    }

    const resetToken = user.generateResetToken();
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.ADMIN_URL}/reset-password?token=${resetToken}`;

    const message = resetPasswordTemplate(user.name, resetUrl);

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
      .update(req.body.token)
      .digest("hex");

    const user = await Admin.findOne({
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

    const accessToken = generateAccessToken({
      _id: user._id as Types.ObjectId,
      role: user.role,
    });
    const refreshToken = generateRefreshToken({
      _id: user._id as Types.ObjectId,
      role: user.role,
    });
    user.refreshToken = refreshToken;

    await user.save();

    res
      .cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
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

export const editProfile = asyncHandler(async (req: any, res: Response) => {
  const updates = req.body;
  const user = await Admin.findByIdAndUpdate(req.user._id, updates, {
    new: true,
    runValidators: true,
  }).select("-password");

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "Admin not found",
    });
  }

  res.status(200).json({
    success: true,
    message: "Profile updated successfully",
    user,
  });
});

export const getProfile = asyncHandler(async (req: any, res: Response) => {
  const user = await Admin.findById(req.user._id).select("-password");

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "Admin not found",
    });
  }

  res.status(200).json({
    success: true,
    user,
  });
});
