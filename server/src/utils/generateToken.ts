import jwt from "jsonwebtoken";
import { env } from "@/config/env.config";

export const generateAccessToken = (user: { _id: string; role: string }) =>
  jwt.sign({ _id: user._id, role: user.role }, env.JWT_ACCESS_SECRET, {
    expiresIn: "15m",
  });

export const generateRefreshToken = (user: { _id: string; role: string }) =>
  jwt.sign(
    { _id: user._id, role: user.role },
    env.JWT_REFRESH_SECRET,
    { expiresIn: "7d" },
  );
