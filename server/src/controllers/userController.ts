import User from "@/models/User";
import bcrypt from "bcryptjs";
import { asyncHandler } from "@/middlewares/asyncHandler";
import {
  generateAccessToken,
  generateRefreshToken,
} from "@/utils/generateToken";
import { Request, Response } from "express";
import { resetPasswordTemplate } from "@/templates/resetEmailTemplate";
import { refreshCookieOptions } from "@/utils/cookies";
import { redis } from "@/config/redis";
import { generateOtp } from "@/utils/generateOtp";
import { sendEmail } from "@/services/emailService";
import { verifyEmailTemplate } from "@/templates/verifyEmailTemplate";
import jwt from "jsonwebtoken";

export const signUp = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
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

  const hashedPassword = await bcrypt.hash(password, 12);
  const otp = generateOtp();

  await redis.set(
    `signup:${email}`,
    JSON.stringify({
      email,
      password: hashedPassword,
      otp,
    }),
    {
      ex: 600, // 10 minutes
    },
  );

  await sendEmail({
    to: email,
    subject: "Verify Your Email",
    html: verifyEmailTemplate(email, otp),
  });

  res.status(200).json({
    success: true,
    message: "OTP sent to email",
  });
});

export const verifySignupOTP = asyncHandler(
  async (req: Request, res: Response) => {
    const { email, otp } = req.body;

    const data = (await redis.get(`signup:${email}`)) as {
      email: string;
      otp: string;
      password: string;
    };

    if (!data) {
      return res.status(400).json({
        success: false,
        message: "OTP expired",
      });
    }

    if (data.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    const newUser = await User.create({
      email: data.email,
      password: data.password,
      isEmailVerified: true,
    });

    await redis.del(`signup:${email}`);

    const accessToken = generateAccessToken({ _id: String(newUser._id), role: newUser.role });
    const refreshToken = generateRefreshToken({ _id: String(newUser._id), role: newUser.role });

    await redis.set(`refresh:${newUser._id}`, refreshToken, {
      ex: 7 * 24 * 60 * 60,
    });

    res
      .cookie("refreshToken", refreshToken, refreshCookieOptions())
      .status(201)
      .json({
        success: true,
        message: "Account verified successfully",
        data: {
          token: accessToken,
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
        },
      });
  },
);

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

  const accessToken = generateAccessToken({ _id: String(user._id), role: user.role });
  const refreshToken = generateRefreshToken({ _id: String(user._id), role: user.role });

  await redis.set(`refresh:${user._id}`, refreshToken, {
    ex: 7 * 24 * 60 * 60,
  });

  res
    .cookie("refreshToken", refreshToken, refreshCookieOptions())
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
        message: "User not found",
      });
    }

    const otp = generateOtp();

    await redis.set(`reset:${email}`, otp, {
      ex: 600,
    });

    await sendEmail({
      to: email,
      subject: "Reset Password - EZ Shop",
      html: resetPasswordTemplate(user.name||"User", otp),
    });

    res.status(200).json({
      success: true,
      message: "Reset OTP sent",
    });
  },
);

export const resetPassword = asyncHandler(async (req, res) => {
  const { email, otp, newPassword } = req.body;

  const storedOTP = await redis.get(`reset:${email}`);

  if (!storedOTP || storedOTP !== otp) {
    return res.status(400).json({
      success: false,
      message: "Invalid or expired OTP",
    });
  }

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  user.password = newPassword;
  await user.save();

  await redis.del(`reset:${email}`);

  res.status(200).json({
    success: true,
    message: "Password reset successful",
  });
});

export const completeProfile = asyncHandler(async (req: any, res: Response) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  user.phone = req.body.phone;
  user.name = req.body.name;
  user.isProfileCompleted = true;

  await user.save();

  res.status(200).json({
    success: true,
    message: "Profile completed",
  });
});

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

export const updatePassword = asyncHandler(async (req: any, res: Response) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({
      success: false,
      message: "Current password and new password are required",
    });
  }

  const user = await User.findById(req.user._id);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  if (!user.password) {
    return res.status(400).json({
      success: false,
      message: "Cannot change password for OAuth accounts",
    });
  }

  const isMatch = await user.matchPassword(currentPassword);
  if (!isMatch) {
    return res.status(400).json({
      success: false,
      message: "Current password is incorrect",
    });
  }

  user.password = newPassword;
  await user.save();

  res.status(200).json({
    success: true,
    message: "Password updated successfully",
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
    const token = req.cookies.refreshToken;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No refresh token",
      });
    }

    let decoded: any;

    try {
      decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET!);
    } catch {
      return res.status(403).json({
        success: false,
        message: "Invalid refresh token",
      });
    }

    const storedToken = await redis.get(`refresh:${decoded._id}`);

    if (!storedToken || storedToken !== token) {
      return res.status(403).json({
        success: false,
        message: "Refresh token mismatch",
      });
    }

    // ROTATE refresh token
    const newRefreshToken = generateRefreshToken(decoded);
    const newAccessToken = generateAccessToken(decoded);

    await redis.set(`refresh:${decoded._id}`, newRefreshToken, {
      ex: 7 * 24 * 60 * 60,
    });

    res
      .cookie("refreshToken", newRefreshToken, refreshCookieOptions())
      .status(200)
      .json({
        success: true,
        token: newAccessToken,
      });
  },
);

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const token = req.cookies.refreshToken;

  if (token) {
    try {
      const decoded: any = jwt.verify(token, process.env.JWT_REFRESH_SECRET!);

      await redis.del(`refresh:${decoded.id}`);
    } catch {
      // ignore
    }
  }

  res.clearCookie("refreshToken", refreshCookieOptions());

  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
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

  const accessToken = generateAccessToken({ _id: String(user._id), role: user.role });
  const refreshToken = generateRefreshToken({ _id: String(user._id), role: user.role });

  await redis.set(`refresh:${user._id}`, refreshToken, {
    ex: 7 * 24 * 60 * 60,
  });

  return res
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
