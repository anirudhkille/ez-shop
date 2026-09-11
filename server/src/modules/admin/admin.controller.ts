import { asyncHandler } from "@/utils/asyncHandler";
import { Request, Response } from "express";
import * as adminService from "@/modules/admin/admin.service";

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ success: false, message: "All fields are required" });
  }

  const result = await adminService.login(email, password);

  res
    .cookie("refreshToken", result.data.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })
    .status(result.status)
    .json(result.data);
});

export const forgotPassword = asyncHandler(
  async (req: Request, res: Response) => {
    const { email } = req.body;
    const result = await adminService.forgotPassword(email);
    res.status(result.status).json(result.data);
  },
);

export const resetPassword = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await adminService.resetPassword(req.body.token, req.body.password);

    res
      .cookie("refreshToken", result.data.refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .status(result.status)
      .json(result.data);
  },
);

export const editProfile = asyncHandler(async (req: any, res: Response) => {
  const result = await adminService.editProfile(req.user._id, req.body);
  res.status(result.status).json(result.data);
});

export const getProfile = asyncHandler(async (req: any, res: Response) => {
  const result = await adminService.getProfile(req.user._id);
  res.status(result.status).json(result.data);
});
