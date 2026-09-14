import mongoose, { Document } from "mongoose";

export interface IVariant extends Document {
  color: string;
  colorCode: string;
  images: string[];
  sizes: {
    size: string;
    stock: number;
    sku: string;
    price: number;

    discountPrice: number;
  }[];
}

export interface IProduct extends Document {
  name: string;
  slug: string;
  description: string;
  category: mongoose.Schema.Types.ObjectId;
  price: number;
  discountPrice: number;
  image: string;
  variants: IVariant[];
  gender: "men" | "women" | "unisex";
  stock: number;
  isFeatured: boolean;
  isBestSellers: boolean;
  rating: number;
  reviewsCount: number;
  tag: string;
  publish: boolean;
}

const variantSchema = new mongoose.Schema<IVariant>({
  color: {
    type: String,
    required: true,
  },
  colorCode: {
    type: String,
  },
  images: [String],
  sizes: [
    {
      size: {
        type: String,
        required: true,
      },
      stock: {
        type: Number,
        required: true,
        default: 0,
      },
      sku: {
        type: String,
      },
      price: {
        type: Number,
      },
      discountPrice: {
        type: Number,
      },
    },
  ],
});

const productSchema = new mongoose.Schema<IProduct>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Category",
    },
    price: {
      type: Number,
      required: true,
    },
    discountPrice: {
      type: Number,
    },
    image: String,
    variants: [variantSchema],
    gender: {
      type: String,
      default: "unisex",
      enum: ["men", "women", "unisex"],
    },
    stock: {
      type: Number,
      required: true,
      default: 0,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isBestSellers: {
      type: Boolean,
      default: false,
    },
    rating: {
      type: Number,
      default: 0,
    },
    reviewsCount: {
      type: Number,
      default: 0,
    },
    tag: {
      type: String,
      enum: ["Best Seller", "Trending", "Limited", "New", "Hot", "Sale", null],
      default: "New",
    },
    publish: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

const Product = mongoose.model("Product", productSchema);
export default Product;
