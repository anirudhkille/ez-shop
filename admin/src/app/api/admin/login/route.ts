import { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";
import { compare } from "bcryptjs";
import { connect } from "@/dbConfig/dbConfig";
import Admin, { IAdmin } from "@/models/Admin";
import { NextResponse } from "next/server";

export async function POST(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "All fields are required",
        },
        { status: 400 }
      );
    }

    await connect();

    const admin = await Admin.findOne({ email });

    if (!admin) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid email or password",
        },
        { status: 401 }
      );
    }

    const isMatch = await compare(password, admin.password);

    if (!isMatch) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid email or password",
        },
        { status: 401 }
      );
    }

    const token = generateToken(admin as IAdmin);

    return NextResponse.json(
      {
        success: true,
        message: "Admin logged in successfully",
        data: {
          token,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error during login:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
        error: (error as Error).message,
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
