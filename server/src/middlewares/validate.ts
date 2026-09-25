import { Request, Response, NextFunction } from "express";
import { z } from "zod";

type ValidationSource = "body" | "params" | "query";

export const validate = (
  schema: z.ZodSchema,
  source: ValidationSource = "body",
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: "Validation error",
        details: result.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
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
