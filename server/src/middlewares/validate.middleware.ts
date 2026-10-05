import { Request, Response, NextFunction } from "express";
import { z } from "zod";

import { sendResponse } from "@/utils/response";

type ValidationSource = "body" | "params" | "query";

export const validate = (
  schema: z.ZodSchema,
  source: ValidationSource = "body",
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      const details = result.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      }));

      return sendResponse(res, 400, "Validation failed", {
        code: "VALIDATION_ERROR",
        details,
      });
    }

    Object.defineProperty(req, source, {
      configurable: true,
      enumerable: true,
      value: result.data,
      writable: true,
    });
    next();
  };
};
