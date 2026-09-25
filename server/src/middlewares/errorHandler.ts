import { Request, Response, NextFunction } from "express";
import { logger } from "@/config/logger";
import { AppError } from "@/utils/appError";
import { sendResponse } from "@/utils/response";

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  if (err instanceof AppError) {
    return sendResponse(res, err.statusCode, err.message, {
      code: err.statusCode >= 500 ? "INTERNAL_SERVER_ERROR" : "API_ERROR",
    });
  }

  logger.error(err.message);

  return sendResponse(res, 500, "Internal Server Error", {
    code: "INTERNAL_SERVER_ERROR",
  });
};
