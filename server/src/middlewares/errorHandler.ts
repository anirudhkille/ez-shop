import { Request, Response, NextFunction } from "express";
import { AppError } from "@/utils/appError";

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  console.error(err.message);

  res.status(500).json({
    success: false,
    message: "Internal Server Error",
  });
};
