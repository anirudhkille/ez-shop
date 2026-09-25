import { asyncHandler } from "@/utils/asyncHandler";
import { sendResponse } from "@/utils/response";
import { Request, Response } from "express";
import * as adminService from "@/modules/admin/admin.service";

const refreshCookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: "strict",
  maxAge: 7 * 24 * 60 * 60 * 1000,
} as const;

const setRefreshCookie = (res: Response, token?: string) => {
  if (token) {
    res.cookie("refreshToken", token, refreshCookieOptions);
  }
};

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const result = await adminService.login(email, password);

  setRefreshCookie(res, result?.refreshToken);

  return sendResponse(res, 200, "Login successful", result);
});

export const forgotPassword = asyncHandler(
  async (req: Request, res: Response) => {
    const { email } = req.body;
    const result = await adminService.forgotPassword(email);

    return sendResponse(res, 200, "Password reset link sent to email", result);
  },
);

export const resetPassword = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await adminService.resetPassword(
      req.body.token,
      req.body.password,
    );

    setRefreshCookie(res, result?.refreshToken);

    return sendResponse(res, 200, "Password reset successful", result);
  },
);

export const editProfile = asyncHandler(async (req: Request, res: Response) => {
  const result = await adminService.editProfile(req.user!._id, req.body);

  return sendResponse(res, 200, "Profile updated successfully", result);
});

export const getProfile = asyncHandler(async (req: Request, res: Response) => {
  const result = await adminService.getProfile(req.user!._id);

  return sendResponse(res, 200, "Profile fetched successfully", result);
});
