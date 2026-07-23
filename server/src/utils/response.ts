import { Response } from "express";

interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

export const sendSuccess = <T>(
  res: Response,
  data: T,
  message = "Success",
  statusCode = 200,
) => {
  return res.status(statusCode).json({ success: true, message, data });
};

export const sendMessage = (
  res: Response,
  message: string,
  statusCode = 200,
) => {
  return res.status(statusCode).json({ success: true, message });
};
