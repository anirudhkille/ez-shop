import jwt, { JwtPayload } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import User from "@/modules/user/user.model";
import Admin from "@/modules/admin/admin.model";
import { env } from "@/config/env.config";
import { asyncHandler } from "../utils/asyncHandler";
import { sendResponse } from "@/utils/response";

interface ITokenPayload extends JwtPayload {
  _id: string;
  role: "User" | "Admin";
}

const loadUser = async (req: Request) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as ITokenPayload;

    if (decoded.role === "User") {
      return await User.findById(decoded._id).select("-password");
    } else if (decoded.role === "Admin") {
      return await Admin.findById(decoded._id).select("-password");
    }

    return null;
  } catch {
    return null;
  }
};

export const protect = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = await loadUser(req);

    if (!user) {
      return sendResponse(res, 401, "Not authorized, no token", {
        code: "UNAUTHORIZED",
      });
    }

    req.user = user as unknown as Express.User;
    next();
  },
);

export const optionalAuth = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction) => {
    const user = await loadUser(req);
    if (user) req.user = user as unknown as Express.User;
    next();
  },
);
