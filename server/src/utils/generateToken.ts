import jwt from "jsonwebtoken";
import { Types } from "mongoose";

export const generateAccessToken = (user: {
  _id: Types.ObjectId;
  role: string;
}) =>
  jwt.sign(
    { id: user._id.toString(), role: user.role },
    process.env.JWT_ACCESS_SECRET!,
    { expiresIn: "15m" }
  );

export const generateRefreshToken = (user: {
  _id: Types.ObjectId;
  role: string;
}) =>
  jwt.sign(
    { id: user._id.toString(), role: user.role },
    process.env.JWT_REFRESH_SECRET!,
    { expiresIn: "7d" }
  );
