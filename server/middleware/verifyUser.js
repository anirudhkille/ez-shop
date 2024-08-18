import jwt from "jsonwebtoken";
import User from "../model/User.js";

export const verifyAdmin = async (req, res, next) => {
  try {
    const authorizationHeader = req.headers.authorization;

    if (!authorizationHeader) {
      return res.status(401).json({
        error: true,
        message: "Authorization Header Not Found or Token Missing",
      });
    }

    const token = authorizationHeader.split(" ")[1];
    const tokenData = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(tokenData.id);

    if (!user || user.role !== "admin") {
      return res.status(403).json({
        error: true,
        message: "Access denied. Admins only.",
      });
    }

    req.tokenData = tokenData; // Add token data to request for further use
    next();
  } catch (error) {
    console.error("Error verifying admin:", error);
    return res.status(500).json({
      error: true,
      message: "Internal server error",
    });
  }
};

export const verifyUser = async (req, res, next) => {
  try {
    const authorizationHeader = req.headers.authorization;

    if (!authorizationHeader) {
      return res.status(401).json({
        error: true,
        message: "Authorization Header Not Found or Token Missing",
      });
    }

    const token = authorizationHeader.split(" ")[1];
    const tokenData = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(tokenData.id);

    if (!user) {
      return res.status(404).json({
        error: true,
        message: "User not found",
      });
    }

    req.tokenData = tokenData; // Add token data to request for further use
    next();
  } catch (error) {
    console.error("Error verifying user:", error);
    return res.status(500).json({
      error: true,
      message: "Internal server error",
    });
  }
};
