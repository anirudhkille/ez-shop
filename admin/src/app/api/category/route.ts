import { connect } from "@/dbConfig/dbConfig";
import Category from "@/models/Category";

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

    const newCategory = new Category({ title, image, publish });
    await newCategory.save();

    return Response.json(
      {
        success: true,
        data: newCategory,
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

    const categories = await Category.find({});
    return Response.json({
      success: true,
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
