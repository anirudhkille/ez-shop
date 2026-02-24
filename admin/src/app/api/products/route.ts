import { connect } from "@/dbConfig/dbConfig";
import Product from "@/models/Product";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const reqBody = await req.json();
    const { title, image, publish } = reqBody;

    if (!image || !title || publish == null) {
      return Response.json(
        {
          success: false,
          message: "All fields are required",
        },
        { status: 400 }
      );
    }

    await connect();

    const newProduct = new Product({ title, image, publish });
    await newProduct.save();

    return Response.json(
      {
        success: true,
        data: newProduct,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : "Unknown error";
    return Response.json(
      {
        success: false,
        message: "Internal server error",
        error: errMessage,
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await connect();

    const categories = await Product.find({});
    return Response.json({
      success: true,
      data: categories,
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
