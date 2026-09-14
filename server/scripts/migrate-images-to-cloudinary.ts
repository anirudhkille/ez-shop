import "dotenv/config";

import { readFile, writeFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

import { v2 as cloudinary } from "cloudinary";
import mongoose from "mongoose";

import Category from "../src/modules/category/category.model";
import Product from "../src/modules/product/product.model";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function uploadImage(
  url: string,
  folder: string,
): Promise<string | null> {
  try {
    const result = await cloudinary.uploader.upload(url, { folder });
    return result.secure_url;
  } catch (error) {
    console.error("Cloudinary upload failed:", url, error);
    return null;
  }
}

async function migrate() {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    throw new Error("MONGO_URI is not defined in the environment");
  }

  await mongoose.connect(uri);
  console.log("Connected to database");

  const mapping = new Map<string, string>();

  const products = await Product.find().lean();
  console.log(`Found ${products.length} products`);

  for (const product of products) {
    const image = product.image;

    if (!image || image.includes("cloudinary.com")) {
      console.log("Skipping product:", product.name);
      continue;
    }

    const newUrl = await uploadImage(image, "ez-shop/products");

    if (newUrl) {
      await Product.updateOne(
        { _id: product._id },
        { $set: { image: newUrl } },
      );
      mapping.set(image, newUrl);
      console.log("Uploaded product image:", product.name);
    }

    await sleep(200);
  }

  const categories = await Category.find().lean();
  console.log(`Found ${categories.length} categories`);

  for (const category of categories) {
    const image = category.image;

    if (!image || image.includes("cloudinary.com")) {
      console.log("Skipping category:", category.name);
      continue;
    }

    const newUrl = await uploadImage(image, "ez-shop/categories");

    if (newUrl) {
      await Category.updateOne(
        { _id: category._id },
        { $set: { image: newUrl } },
      );
      mapping.set(image, newUrl);
      console.log("Uploaded category image:", category.name);
    }

    await sleep(200);
  }

  if (mapping.size > 0) {
    const seedPath = path.resolve(__dirname, "seed-products.ts");
    let seedContent = await readFile(seedPath, "utf-8");

    for (const [oldUrl, newUrl] of mapping.entries()) {
      seedContent = seedContent.split(oldUrl).join(newUrl);
    }

    await writeFile(seedPath, seedContent, "utf-8");
    console.log(`Updated ${mapping.size} image URL(s) in seed-products.ts`);
  }

  console.log("Migration complete");
  await mongoose.disconnect();
  console.log("Disconnected from database");
}

migrate().catch((error) => {
  console.error(error);
  process.exit(1);
});
