import { Request, Response, NextFunction } from "express";

import { sendResponse } from "@/utils/response";

export const authorize = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user || !roles.includes(user.role)) {
      return sendResponse(res, 403, "Access denied", { code: "FORBIDDEN" });
    }

    next();
  };
};
