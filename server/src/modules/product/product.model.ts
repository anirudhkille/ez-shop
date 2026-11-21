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
  category: mongoose.Types.ObjectId;
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
  imageAlt?: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
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
    imageAlt: {
      type: String,
      trim: true,
      maxlength: 160,
    },
    seoTitle: {
      type: String,
      trim: true,
      maxlength: 70,
    },
    seoDescription: {
      type: String,
      trim: true,
      maxlength: 160,
    },
    seoKeywords: {
      type: String,
      trim: true,
      maxlength: 300,
    },
  },
  { timestamps: true },
);

// Full-text search. The storefront uses Atlas Search when configured; this
// index keeps local development, CI and the fallback path working.
productSchema.index(
  { name: "text", description: "text", slug: "text", tag: "text" },
  {
    name: "product_text",
    weights: { name: 10, tag: 5, slug: 3, description: 1 },
  },
);
productSchema.index(
  { name: 1 },
  {
    name: "product_name_prefix",
  },
);

// Storefront listing and filter queries always start from published products.
productSchema.index(
  { publish: 1, category: 1, createdAt: -1, _id: 1 },
  { name: "product_category_newest" },
);
productSchema.index(
  { publish: 1, category: 1, price: 1, discountPrice: 1, _id: 1 },
  { name: "product_category_price" },
);
productSchema.index(
  { publish: 1, category: 1, price: -1, discountPrice: -1, _id: 1 },
  { name: "product_category_price_desc" },
);
productSchema.index(
  { publish: 1, category: 1, rating: -1, _id: 1 },
  { name: "product_category_rating" },
);
productSchema.index(
  { publish: 1, price: 1, discountPrice: 1, _id: 1 },
  { name: "product_price" },
);
productSchema.index(
  { publish: 1, price: -1, discountPrice: -1, _id: 1 },
  { name: "product_price_desc" },
);
productSchema.index(
  { publish: 1, gender: 1, price: 1, discountPrice: 1, _id: 1 },
  { name: "product_gender_price" },
);
productSchema.index(
  { publish: 1, tag: 1, createdAt: -1, _id: 1 },
  { name: "product_tag_newest" },
);
productSchema.index(
  { publish: 1, isFeatured: -1, _id: 1 },
  { name: "product_featured_newest" },
);
productSchema.index(
  { publish: 1, isBestSellers: 1, createdAt: -1, _id: 1 },
  { name: "product_bestsellers_newest" },
);
productSchema.index(
  { publish: 1, rating: -1, _id: 1 },
  { name: "product_rating" },
);
productSchema.index(
  { publish: 1, "variants.sizes.size": 1, _id: 1 },
  { name: "product_size" },
);
productSchema.index(
  { publish: 1, "variants.color": 1, _id: 1 },
  { name: "product_color" },
);
productSchema.index(
  { publish: 1, createdAt: -1, _id: 1 },
  { name: "product_newest" },
);

const Product = mongoose.model("Product", productSchema);
export default Product;
