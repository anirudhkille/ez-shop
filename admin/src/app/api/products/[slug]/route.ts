import { connect } from "@/dbConfig/dbConfig";
import Product from "@/models/Product";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const slug = (await params).slug;

    await connect();

    const product = await Product.findOne({ slug }).populate("category", "title");

    if (!product) {
      return Response.json(
        {
          success: false,
          message: "Product not found",
        },
        { status: 404 }
      );
    }
    return Response.json({
      success: true,
      message: "Product fetched successfully",
      data: product,
    });
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

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const slug = (await params).slug;
    const reqBody = await request.json();
    await connect();

    const product = await Product.findOneAndUpdate(
      { slug },
      { ...reqBody },
      { new: true }
    );

    if (!product) {
      return Response.json(
        {
          success: false,
          message: "Product not found",
        },
        { status: 404 }
      );
    }
    return Response.json({
      success: true,
      message: "Product updated successfully",
      data: product,
    });
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

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const slug = (await params).slug;
    await connect();

    const product = await Product.findOneAndDelete({ slug });

    if (!product) {
      return Response.json(
        {
          success: false,
          message: "Product not found",
        },
        { status: 404 }
      );
    }

    return Response.json({
      success: true,
      message: "Product deleted successfully",
    });
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
