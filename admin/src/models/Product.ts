import { generateSlug } from "@/lib/slug";
import mongoose from "mongoose";

interface Map {
  key: string;
  value: string;
}

export interface IProduct {
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

productSchema.pre("save", async function (next) {
  const product = this;
  if (!product.isModified("title")) {
    return next();
  }

  let baseSlug = generateSlug(product.title);
  let uniqueSlug = baseSlug;
  let counter = 1;

  while (await Product.exists({ slug: uniqueSlug })) {
    uniqueSlug = `${baseSlug}-${counter}`;
    counter++;
  }

  product.slug = uniqueSlug;
  next();
});

productSchema.pre("findOneAndUpdate", async function (next) {
  const update = this.getUpdate() as IProduct;

  if (!update.title) {
    return next();
  }

  let baseSlug = generateSlug(update.title);
  let uniqueSlug = baseSlug;
  let counter = 1;

  while (await Product.exists({ slug: uniqueSlug })) {
    uniqueSlug = `${baseSlug}-${counter}`;
    counter++;
  }

  update.slug = uniqueSlug;
  next();
});

const Product =
  mongoose.models.Product || mongoose.model("Product", productSchema);

export default Product;
