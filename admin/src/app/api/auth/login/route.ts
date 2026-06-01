import jwt from "jsonwebtoken";
import { connect } from "@/dbConfig/dbConfig";
import Admin, { IAdmin } from "@/models/Admin";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return Response.json(
        { success: false, message: "All fields are required" },
        { status: 400 }
      );
    }

    await connect();

    const admin = await Admin.findOne({ email });

    if (!admin) {
      return Response.json(
        { success: false, message: "Invalid email or password" },
        { status: 401 }
      );
    }

    const isMatch = await admin.matchPassword(password);

    if (!isMatch) {
      return Response.json(
        { success: false, message: "Invalid email or password" },
        { status: 401 }
      );
    }

    const token = generateToken(admin as IAdmin);
    const refreshToken = generateRefreshToken(admin as IAdmin);

    const cookieStore = await cookies();
    cookieStore.set("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    return Response.json(
      {
        success: true,
        message: "Admin logged in successfully",
        data: {
          name: admin.name,
          email: admin.email,
          token,
        },
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : "Unknown error";
    return Response.json(
      { success: false, message: "Internal server error", error: errMessage },
      { status: 500 }
    );
  }
}

function generateToken(admin: IAdmin) {
  return jwt.sign(
    { id: admin._id, role: "admin" },
    process.env.JWT_ACCESS_SECRET!,
    { expiresIn: "1h" }
  );
}

function generateRefreshToken(admin: IAdmin) {
  return jwt.sign(
    { id: admin._id, role: "admin" },
    process.env.JWT_REFRESH_SECRET!,
    { expiresIn: "7d" }
  );
}