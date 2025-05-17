import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Admin from "../models/Admin.js";
import asyncHandler from "express-async-handler";

export const protect = asyncHandler(async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    res
      .status(401)
      .json({ success: false, message: "Not authorized, no token" });
    return;
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  let user;
  if (decoded.role === "User") {
    user = await User.findById(decoded._id).select("-password");
  } else if (decoded.role === "SuperAdmin") {
    user = await SuperAdmin.findById(decoded._id).select("-password");
  }

  if (!user) {
    return res.status(401).json({ success: false, message: "User not found" });
  }

  req.user = user;
  next();
});
