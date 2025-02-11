import { connect } from "@/dbConfig/dbConfig";
import Category from "@/models/Category";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const slug = (await params).slug;

    await connect();

    const categories = await Category.findOne({ slug: slug });

    if (!categories) {
      return Response.json(
        {
          success: false,
          message: "Category not found",
        },
        { status: 404 }
      );
    }
    return Response.json({
      success: true,
      message: "Category fetched successfully",
      data: categories,
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

    const categories = await Category.findOneAndUpdate(
      { slug: slug },
      { ...reqBody },
      { new: true }
    );

    if (!categories) {
      return Response.json(
        {
          success: false,
          message: "Category not found",
        },
        { status: 404 }
      );
    }
    return Response.json({
      success: true,
      message: "Category updated successfully",
      data: categories,
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

    const categories = await Category.findOneAndDelete({ slug: slug });

    if (!categories) {
      return Response.json(
        {
          success: false,
          message: "Category not found",
        },
        { status: 404 }
      );
    }

    return Response.json({
      success: true,
      message: "Category deleted successfully",
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
