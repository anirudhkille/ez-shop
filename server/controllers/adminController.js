import { OAuth2Client } from "google-auth-library";
import Admin from "../model/Admin.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import nodemailer from "nodemailer";
import { resetPasswordTemplate } from "../utils/resetEmailTemplate.js";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const generateToken = (admin) => {
  return jwt.sign({ id: admin._id, role: admin.role }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });
};

export const signUp = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const adminExists = await Admin.findOne({ email });
    if (adminExists) {
      return res.status(409).json({
        success: false,
        message: "Email already registered with ezshop",
      });
    }

    const newAdmin = await Admin.create({ name, email, password });
    const token = generateToken(newAdmin);

    res.status(201).json({
      success: true,
      message: "Admin registered successfully",
      data: {
        token,
        id: newAdmin._id,
        name: newAdmin.name,
        email: newAdmin.email,
        role: newAdmin.role,
      },
    });
  } catch (error) {
    console.error("Error during sign up:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });
    }

    const isMatch = await admin.matchPassword(password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });
    }

    const token = generateToken(admin);

    res.status(200).json({
      success: true,
      message: "Admin logged in successfully",
      data: {
        token,
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin with this email does not exist",
      });
    }

    const resetToken = admin.generateResetToken();
    await admin.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.ADMIN_URL}/reset-password?token=${resetToken}`;

    const message = resetPasswordTemplate(admin.name, resetUrl);

    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    await transporter.sendMail({
      to: admin.email,
      subject: "Password Reset Request",
      html: resetPasswordTemplate(admin.name, resetUrl),
    });

    res.status(200).json({
      success: true,
      message: "Password reset link sent to email",
    });
  } catch (error) {
    console.error("Error during forgot password:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const resetPassword = async (req, res) => {
  console.log(req.body);
  try {
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(req.body.token)
      .digest("hex");

    const admin = await Admin.findOne({
      resetPasswordToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!admin) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token",
      });
    }

    admin.password = req.body.password;
    admin.resetPasswordToken = undefined;
    admin.resetPasswordExpires = undefined;

    await admin.save();

    const token = generateToken(admin);

    res.status(200).json({
      success: true,
      message: "Password reset successful",
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error("Error during password reset:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const editProfile = async (req, res) => {
  try {
    const updates = req.body;
    const admin = await Admin.findByIdAndUpdate(req.admin.id, updates, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      admin,
    });
  } catch (error) {
    console.error("Error during edit profile:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin.id).select("-password");

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    res.status(200).json({
      success: true,
      admin,
    });
  } catch (error) {
    console.error("Error during get profile:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const googleLogin = async (req, res) => {
  try {
    const { token: tokenId } = req.body;

    if (!tokenId) {
      return res.status(400).json({
        success: false,
        message: "Google token is required",
      });
    }

    // Log the tokenId to ensure it's received correctly
    console.log("Received Google token:", tokenId);

    // Verify the token with Google's OAuth client
    const ticket = await client.verifyIdToken({
      idToken: tokenId,
      audience: process.env.GOOGLE_CLIENT_ID, // Make sure this matches your Google Client ID
    });

    // Log the payload to see the details from Google
    const { email, name, sub: googleId } = ticket.getPayload();
    console.log("Google token payload:", { email, name, googleId });

    // Check if the user exists in your Admin database
    const admin = await Admin.findOne({ email });

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Email not registered",
      });
    }

    // Generate a token for the admin
    const token = generateToken(admin);

    return res.status(200).json({
      success: true,
      message: "Admin logged in successfully",
      data: {
        token,
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error("Error during Google login:", error);
    if (error.response) {
      // If error comes from Google's OAuth client
      return res.status(400).json({
        success: false,
        message: error.response.error || "Invalid Google token",
      });
    }
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
