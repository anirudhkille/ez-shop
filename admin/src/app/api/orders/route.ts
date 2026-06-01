import { connect } from "@/dbConfig/dbConfig";
import Order from "@/models/Order";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connect();

    const orders = await Order.find({})
      .populate("user", "name email")
      .populate("products.product", "title image")
      .sort({ createdAt: -1 });

    return Response.json({
      success: true,
      message: "Orders fetched successfully",
      data: orders,
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
