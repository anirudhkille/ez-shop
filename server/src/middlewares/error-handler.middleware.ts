import { Request, Response, NextFunction } from "express";
import { logger } from "@/config/logger";
import { Sentry, sentryEnabled } from "@/config/sentry";
import { AppError } from "@/utils/app-error";
import { sendResponse } from "@/utils/response";

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  const expected = err instanceof AppError && err.statusCode < 500;

  if (!expected && sentryEnabled) {
    Sentry.withScope((scope) => {
      if (req.user) {
        scope.setUser({ id: String(req.user._id) });
      }

      scope.setTag("method", req.method);
      scope.setTag("route", req.route?.path ?? req.path);

      Sentry.captureException(err);
    });
  }

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
