import { connect } from "@/dbConfig/dbConfig";
import Product from "@/models/Product";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const reqBody = await req.json();
    const { title, description, price, discountPrice, stock, image, publish } = reqBody;

    if (!title || !description || !image || image.length === 0 || price == null || stock == null || publish == null) {
      return Response.json(
        {
          success: false,
          message: "All fields are required",
        },
        { status: 400 }
      );
    }

    await connect();

    const newProduct = new Product({
      title,
      description,
      price,
      discountPrice,
      stock,
      image,
      publish,
    });
    await newProduct.save();

    return Response.json(
      {
        success: true,
        message: "Product created successfully",
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

    const products = await Product.find({}).populate("category", "title");
    return Response.json({
      success: true,
      message: "Products fetched successfully",
      data: products,
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
