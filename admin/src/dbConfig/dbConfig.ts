import mongoose from "mongoose";

export async function connect() {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI!);

    console.log(`Connected to MongoDB: ${conn.connection.host}`);
  } catch (error) {
    console.log("Error connecting to MongoDB:", error);
    process.exit(1);
  }
}
