import { connect } from "@/dbConfig/dbConfig";
import User from "@/models/User";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connect();

    const users = await User.find({}).sort({ createdAt: -1 });

    return Response.json({
      success: true,
      message: "Users fetched successfully",
      data: users,
    });
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
        error: errMessage,
      },
      { status: 500 }
    );
  }
}
