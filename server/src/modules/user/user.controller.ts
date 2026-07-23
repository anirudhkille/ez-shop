import { Request, Response } from "express";
import { asyncHandler } from "@/utils/asyncHandler";
import * as userService from "@/modules/user/user.service";
import { sendSuccess, sendMessage } from "@/utils/response";
import { refreshCookieOptions } from "@/utils/cookies";

export const signUp = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const result = await userService.signUp(email, password);
  sendMessage(res, result.message, 200);
});

export const verifySignupOTP = asyncHandler(
  async (req: Request, res: Response) => {
    const { email, otp } = req.body;
    const result = await userService.verifySignupOTP(email, otp);

    res
      .cookie("refreshToken", result.refreshToken, refreshCookieOptions())
      .status(201)
      .json({
        success: true,
        message: "Account verified successfully",
        data: result.user,
        token: result.accessToken,
      });
  },
);

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const result = await userService.login(email, password);

  res
    .cookie("refreshToken", result.refreshToken, refreshCookieOptions())
    .status(200)
    .json({
      success: true,
      message: "Login successful",
      data: result.user,
      token: result.accessToken,
    });
});

export const forgotPassword = asyncHandler(
  async (req: Request, res: Response) => {
    const { email } = req.body;
    const result = await userService.forgotPassword(email);
    sendMessage(res, result.message);
  },
);

export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const { email, otp, newPassword } = req.body;
  const result = await userService.resetPassword(email, otp, newPassword);
  sendMessage(res, result.message);
});

export const completeProfile = asyncHandler(
  async (req: any, res: Response) => {
    const result = await userService.completeProfile(req.user._id, req.body);
    sendMessage(res, result.message);
  },
);

export const getProfile = asyncHandler(async (req: any, res: Response) => {
  const result = await userService.getProfile(req.user._id);
  sendSuccess(res, result.user);
});

export const updatePassword = asyncHandler(
  async (req: any, res: Response) => {
    const { currentPassword, newPassword } = req.body;
    const result = await userService.updatePassword(
      req.user._id,
      currentPassword,
      newPassword,
    );
    sendMessage(res, result.message);
  },
);

export const updateProfile = asyncHandler(
  async (req: any, res: Response) => {
    const result = await userService.updateProfile(req.user._id, req.body);
    sendSuccess(res, result.user);
  },
);

export const refreshToken = asyncHandler(
  async (req: Request, res: Response) => {
    const token = req.cookies.refreshToken;
    const result = await userService.refreshToken(token);

    res
      .cookie("refreshToken", result.refreshToken, refreshCookieOptions())
      .status(200)
      .json({
        success: true,
        token: result.accessToken,
      });
  },
);

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const token = req.cookies.refreshToken;
  const result = await userService.logout(token);

  res.clearCookie("refreshToken", refreshCookieOptions());
  sendMessage(res, result.message);
});

export const googleLogin = asyncHandler(
  async (req: Request, res: Response) => {
    const googleUser = req.user as {
      email?: string;
      name?: string;
      googleId: string;
      avatar?: string;
    };

    const result = await userService.googleLogin(googleUser);

    const frontendURL = process.env.FRONTEND_URL || "http://localhost:5173";
    const redirectURL = `${frontendURL}/auth/google-callback?token=${encodeURIComponent(result.accessToken)}&name=${encodeURIComponent(result.user.name || "")}&email=${encodeURIComponent(result.user.email || "")}`;

    return res
      .cookie("refreshToken", result.refreshToken, refreshCookieOptions())
      .redirect(redirectURL);
  },
);
