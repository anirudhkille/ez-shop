import { Request, Response } from "express";
import { asyncHandler } from "@/utils/asyncHandler";
import { env } from "@/config/env.config";
import * as userService from "@/modules/user/user.service";
import { sendResponse } from "@/utils/response";
import { refreshCookieOptions } from "@/utils/cookies";

export const signUp = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  await userService.signUp(email, password);

  return sendResponse(res, 201, "OTP sent to email", { sent: true });
});

export const verifySignupOTP = asyncHandler(
  async (req: Request, res: Response) => {
    const { email, otp } = req.body;
    const result = await userService.verifySignupOTP(email, otp);

    res.cookie("refreshToken", result.refreshToken, refreshCookieOptions());

    return sendResponse(res, 201, "Account verified successfully", {
      ...result.user,
      token: result.accessToken,
    });
  },
);

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const result = await userService.login(email, password);

  res.cookie("refreshToken", result.refreshToken, refreshCookieOptions());

  return sendResponse(res, 200, "Login successful", {
    ...result.user,
    token: result.accessToken,
  });
});

export const forgotPassword = asyncHandler(
  async (req: Request, res: Response) => {
    const { email } = req.body;
    await userService.forgotPassword(email);

    return sendResponse(res, 200, "Reset OTP sent", { sent: true });
  },
);

export const resetPassword = asyncHandler(
  async (req: Request, res: Response) => {
    const { token, newPassword } = req.body;
    await userService.resetPassword(token, newPassword);

    return sendResponse(res, 200, "Password reset successful", {
      reset: true,
    });
  },
);

export const getProfile = asyncHandler(async (req: Request, res: Response) => {
  const user = await userService.getProfile(req.user!._id);

  return sendResponse(res, 200, "Profile fetched successfully", user);
});

export const updatePassword = asyncHandler(
  async (req: Request, res: Response) => {
    const { currentPassword, newPassword } = req.body;
    await userService.updatePassword(
      req.user!._id,
      currentPassword,
      newPassword,
    );

    return sendResponse(res, 200, "Password updated successfully", {
      updated: true,
    });
  },
);

export const updateProfile = asyncHandler(
  async (req: Request, res: Response) => {
    const user = await userService.updateProfile(req.user!._id, req.body);

    return sendResponse(res, 200, "Profile updated successfully", user);
  },
);

export const refreshToken = asyncHandler(
  async (req: Request, res: Response) => {
    const token = req.cookies.refreshToken;
    const result = await userService.refreshToken(token);

    res.cookie("refreshToken", result.refreshToken, refreshCookieOptions());

    return sendResponse(res, 200, "Access token refreshed", {
      token: result.accessToken,
    });
  },
);

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const token = req.cookies.refreshToken;
  await userService.logout(token);

  res.clearCookie("refreshToken", refreshCookieOptions());

  return sendResponse(res, 200, "Logged out successfully", {
    loggedOut: true,
  });
});

export const getAllUsers = asyncHandler(async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const result = await userService.getAllUsers(page, limit);

  return sendResponse(
    res,
    200,
    "Users fetched successfully",
    result.items,
    result.pagination,
  );
});

export const getUserById = asyncHandler(async (req: Request, res: Response) => {
  const user = await userService.getUserById(req.params.id);

  return sendResponse(res, 200, "User fetched successfully", user);
});

export const getUserAdminDetail = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await userService.getUserAdminDetail(req.params.id);

    return sendResponse(res, 200, "User details fetched successfully", result);
  },
);

export const deleteUserById = asyncHandler(
  async (req: Request, res: Response) => {
    await userService.deleteUserById(req.params.id);

    return sendResponse(res, 200, "User deleted successfully", {
      deleted: true,
    });
  },
);

export const googleLogin = asyncHandler(async (req: Request, res: Response) => {
  const googleUser = req.user as unknown as {
    email?: string;
    name?: string;
    googleId: string;
    avatar?: string;
  };

  const result = await userService.googleLogin(googleUser);

  const frontendURL = env.CLIENT_URL;
  const redirectURL = `${frontendURL}/auth/google-callback?token=${encodeURIComponent(result.accessToken)}&name=${encodeURIComponent(result.user.name || "")}&email=${encodeURIComponent(result.user.email || "")}`;

  return res
    .cookie("refreshToken", result.refreshToken, refreshCookieOptions())
    .redirect(redirectURL);
});
