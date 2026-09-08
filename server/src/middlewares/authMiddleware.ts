import jwt, { JwtPayload } from "jsonwebtoken";
import { Response, NextFunction } from "express";
import User from "@/modules/user/user.model";
import Admin from "@/modules/admin/admin.model";
import { env } from "@/config/env.config";
import { asyncHandler } from "../utils/asyncHandler";

interface ITokenPayload extends JwtPayload {
  _id: string;
  role: "User" | "Admin";
}

const loadUser = async (req: any) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(
      token,
      env.JWT_ACCESS_SECRET,
    ) as ITokenPayload;

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
  async (req: any, res: Response, next: NextFunction) => {
    const user = await loadUser(req);

    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Not authorized, no token" });
    }

    req.user = user;
    next();
  },
);

export const optionalAuth = asyncHandler(
  async (req: any, _res: Response, next: NextFunction) => {
    const user = await loadUser(req);
    if (user) req.user = user;
    next();
  },
);
