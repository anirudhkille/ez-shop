import { connect } from "@/dbConfig/dbConfig";
import Admin from "@/models/Admin";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get("refreshToken")?.value;

    if (!refreshToken) {
      return Response.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    let decoded: { id: string };
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_ACCESS_SECRET!) as {
        id: string;
      };
    } catch {
      return Response.json(
        { success: false, message: "Invalid token" },
        { status: 401 }
      );
    }

    await connect();

    const admin = await Admin.findById(decoded.id).select("-password");

    if (!admin) {
      return Response.json(
        { success: false, message: "Admin not found" },
        { status: 404 }
      );
    }

    return Response.json({
      success: true,
      data: admin,
    });
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : "Unknown error";
    return Response.json(
      { success: false, message: "Internal server error", error: errMessage },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get("refreshToken")?.value;

    if (!refreshToken) {
      return Response.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    let decoded: { id: string };
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_ACCESS_SECRET!) as {
        id: string;
      };
    } catch {
      return Response.json(
        { success: false, message: "Invalid token" },
        { status: 401 }
      );
    }

    const reqBody = await request.json();
    await connect();

    const admin = await Admin.findByIdAndUpdate(decoded.id, reqBody, {
      new: true,
    }).select("-password");

    if (!admin) {
      return Response.json(
        { success: false, message: "Admin not found" },
        { status: 404 }
      );
    }

    return Response.json({
      success: true,
      message: "Profile updated successfully",
      data: admin,
    });
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : "Unknown error";
    return Response.json(
      { success: false, message: "Internal server error", error: errMessage },
      { status: 500 }
    );
  }
}
