import jwt from "jsonwebtoken";

export const generateAccessToken = (user: {
  _id: string;
  role: string;
}) =>
  jwt.sign(
    { _id: user._id, role: user.role },
    process.env.JWT_ACCESS_SECRET!,
    { expiresIn: "15m" }
  );

export const generateRefreshToken = (user: {
  _id: string;
  role: string;
}) =>
  jwt.sign(
    { _id: user._id, role: user.role },
    process.env.JWT_REFRESH_SECRET!,
    { expiresIn: "7d" }
  );
