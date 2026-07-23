import mongoose from "mongoose";
import { Document } from "mongoose";

export interface ICategory extends Document {
  name: string;
  slug: string;
  image: string;
}

const categorySchema = new mongoose.Schema<ICategory>({
  name: {
    type: String,
    required: true,
  },
  slug: { type: String, required: true, unique: true },
  image: {
    type: String,
    required: true,
  },
});

const Category = mongoose.model<ICategory>("Category", categorySchema);
export default Category;
