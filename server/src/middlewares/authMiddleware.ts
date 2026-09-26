import jwt, { JwtPayload } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import * as userRepository from "@/modules/user/user.repository";
import * as adminRepository from "@/modules/admin/admin.repository";
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
      return await userRepository.findById(decoded._id, "-password");
    } else if (decoded.role === "Admin") {
      return await adminRepository.findById(decoded._id, "-password");
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
