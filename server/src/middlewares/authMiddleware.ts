import jwt, { JwtPayload } from "jsonwebtoken";
import { Response, NextFunction } from "express";
import User from "@/models/User";
import Admin from "@/models/Admin";
import { asyncHandler } from "./asyncHandler";

interface ITokenPayload extends JwtPayload {
  id: string;
  role: "User" | "Admin";
}

export const protect = asyncHandler(
  async (req: any, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ success: false, message: "Not authorized, no token" });
    }

    const token = authHeader.split(" ")[1];

    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_ACCESS_SECRET as string,
      ) as ITokenPayload;

      let user;

      if (decoded.role === "User") {
        user = await User.findById(decoded._id).select("-password");
      } else if (decoded.role === "Admin") {
        user = await Admin.findById(decoded._id).select("-password");
      }

      if (!user) {
        return res
          .status(401)
          .json({ success: false, message: "User not found" });
      }

      req.user = user;
      next();
    } catch (error) {
      return res
        .status(403)
        .json({ success: false, message: "Invalid or expired token" });
    }
  },
);
