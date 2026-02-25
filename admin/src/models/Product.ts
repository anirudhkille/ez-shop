import { generateSlug } from "@/lib/slug";
import mongoose, { type Document, type Model } from "mongoose";

interface Map {
  key: string;
  value: string;
}

export interface IProduct extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  slug: string;
  category: mongoose.Types.ObjectId;
  description: string;
  image: string[];
  content: string;
  colors?: Map[];
  sizes?: Map[];
  price: number;
  discountPrice: number;
  stock: number;
  publish: boolean;
}

const productSchema = new mongoose.Schema<IProduct>(
  {
    title: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      unique: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },
    description: {
      type: String,
      required: true,
    },
    image: [
      {
        type: String,
        required: true,
      },
    ],
    content: {
      type: String,
      required: true,
    },
    colors: [
      {
        key: String,
        value: String,
      },
    ],
    sizes: [
      {
        key: String,
        value: String,
      },
    ],
    price: {
      type: Number,
    },
    discountPrice: {
      type: Number,
    },
    publish: {
      type: Boolean,
      required: true,
    },
  },
  { timestamps: true }
);

const generateUniqueSlug = async (
  baseSlug: string,
  Category: Model<IProduct>
): Promise<string> => {
  let uniqueSlug = baseSlug;
  let counter = 1;

  while (await Category.exists({ slug: uniqueSlug })) {
    uniqueSlug = `${baseSlug}-${counter}`;
    counter++;
  }

  return uniqueSlug;
};

productSchema.pre("save", async function (next) {
  if (!this.isModified("title")) return next();

  const baseSlug = generateSlug(this.title);
  this.slug = await generateUniqueSlug(
    baseSlug,
    this.constructor as Model<IProduct>
  );
  next();
});

productSchema.pre("findOneAndUpdate", async function (next) {
  const update = this.getUpdate() as Partial<IProduct>;
  if (!update.title) return next();

  const baseSlug = generateSlug(update.title);
  update.slug = await generateUniqueSlug(
    baseSlug,
    this.model as Model<IProduct>
  );
  next();
});

const Product =
  mongoose.models.Product || mongoose.model<IProduct>("Product", productSchema);
export default Product;
