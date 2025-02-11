import jwt from "jsonwebtoken";
import { compare } from "bcryptjs";
import { connect } from "@/dbConfig/dbConfig";
import Admin, { IAdmin } from "@/models/Admin";
import { setCookie } from "cookies-next";

export async function POST(req: Request) {
  if (req.method !== "POST") {
    return Response.json({
      success: false,
      message: "Method not allowed",
    });
  }

  try {
    const reqBody = await req.json();
    const { email, password } = reqBody;

    if (!email || !password) {
      return Response.json({
        success: false,
        message: "All fields are required",
      });
    }

    await connect();

    const admin = await Admin.findOne({ email });

    if (!admin) {
      return Response.json(
        {
          success: false,
          message: "Invalid email or password",
        },
        { status: 401 }
      );
    }

    const isMatch = await compare(password, admin.password);

    if (!isMatch) {
      return Response.json(
        {
          success: false,
          message: "Invalid email or password",
        },
        { status: 404 }
      );
    }

    const token = generateToken(admin as IAdmin);
    const refreshToken = generateRefreshToken(admin as IAdmin);

    // Set refresh token in cookies
    setCookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
    });

    return Response.json(
      {
        success: true,
        message: "Admin logged in successfully",
        data: {
          name: admin.name,
          email: admin.email,
          token,
          refreshToken,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    return Response.json(
      {
        success: false,
        message: "Internal server error",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

function generateToken(admin: IAdmin) {
  return jwt.sign({ id: admin._id, role: "admin" }, process.env.JWT_SECRET!, {
    expiresIn: "1h",
  });
}

function generateRefreshToken(admin: IAdmin) {
  return jwt.sign({ id: admin._id, role: "admin" }, process.env.JWT_SECRET!, {
    expiresIn: "7d",
  });
}
