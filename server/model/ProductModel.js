import mongoose from "mongoose";

const productSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  brand: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  subCategory: {
    type: String,
  },
  price: {
    type: Number,
    required: true,
  },
  discountPrice: {
    type: Number,
  },
  colors: [
    {
      name: String,
      hexCode: String,
      imageUrl: String,
    },
  ],
  sizes: [
    {
      size: String,
      stock: Number,
    },
  ],
  images: [
    {
      url: String,
      altText: String,
    },
  ],
  rating: {
    type: Number,
    default: 0,
  },
  
  stock: {
    type: Number,
    required: true,
  },
  isFeatured: {
    type: Boolean,
    default: false,
  },
  isNewArrival: {
    type: Boolean,
    default: false,
  },
  tags: [String],
  sku: {
    type: String,
    unique: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
