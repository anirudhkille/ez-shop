import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  category: {
    type: String,
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
  images: [
    {
      url: String,
      altText: String,
    },
  ],
  stock: {
    type: Number,
    required: true,
    default: 0,
  },
  isFeatured: {
    type: Boolean,
    default: false,
  },
  isNewArrival: {
    type: Boolean,
    default: false,
  },
});

const Product = mongoose.model("Product", productSchema);
export default Product;
