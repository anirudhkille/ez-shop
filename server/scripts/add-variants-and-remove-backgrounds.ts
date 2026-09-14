import "dotenv/config";

import mongoose from "mongoose";

import "../src/modules/category/category.model";
import Product from "../src/modules/product/product.model";

interface VariantConfig {
  colors: { name: string; code: string }[];
  sizes: string[];
}

const variantConfigByCategory: Record<string, VariantConfig> = {
  shoes: {
    colors: [
      { name: "Black", code: "000000" },
      { name: "White", code: "FFFFFF" },
      { name: "Navy", code: "1E3A8A" },
    ],
    sizes: ["7", "8", "9", "10"],
  },
  accessories: {
    colors: [
      { name: "Black", code: "000000" },
      { name: "Brown", code: "8B4513" },
      { name: "Silver", code: "C0C0C0" },
    ],
    sizes: ["One Size"],
  },
  men: {
    colors: [
      { name: "Black", code: "000000" },
      { name: "White", code: "FFFFFF" },
      { name: "Olive", code: "556B2F" },
    ],
    sizes: ["S", "M", "L"],
  },
  clothing: {
    colors: [
      { name: "Black", code: "000000" },
      { name: "White", code: "FFFFFF" },
      { name: "Beige", code: "F5F5DC" },
    ],
    sizes: ["S", "M", "L"],
  },
  women: {
    colors: [
      { name: "Black", code: "000000" },
      { name: "Blush", code: "FFC0CB" },
      { name: "Navy", code: "1E3A8A" },
    ],
    sizes: ["S", "M", "L"],
  },
  kids: {
    colors: [
      { name: "Blue", code: "3B82F6" },
      { name: "Red", code: "EF4444" },
      { name: "Green", code: "22C55E" },
    ],
    sizes: ["S", "M", "L"],
  },
};

function parsePublicId(url: string): string | null {
  const match = url.match(/\/upload\/(?:v\d+\/)?(.+?)\.[^.]+$/);
  return match?.[1] ?? null;
}

function makeImageUrl(cloudName: string, publicId: string, transforms: string) {
  return `https://res.cloudinary.com/${cloudName}/image/upload/${transforms}/${publicId}.png`;
}

async function migrate() {
  const uri = process.env.MONGO_URI;
  const cloudName = process.env.CLOUDINARY_NAME;

  if (!uri) {
    throw new Error("MONGO_URI is not defined in the environment");
  }

  if (!cloudName) {
    throw new Error("CLOUDINARY_NAME is not defined in the environment");
  }

  await mongoose.connect(uri);
  console.log("Connected to database");

  const products = await Product.find().populate("category", "slug").lean();
  console.log(`Processing ${products.length} products`);

  const bulkOps = [];
  let skipped = 0;

  for (const product of products) {
    const categorySlug = (product.category as { slug: string }).slug;
    const config = variantConfigByCategory[categorySlug];

    if (!config) {
      console.warn("No variant config for category:", categorySlug);
      skipped++;
      continue;
    }

    const publicId = parsePublicId(product.image);

    if (!publicId) {
      console.warn("Could not parse public id for:", product.name);
      skipped++;
      continue;
    }

    const noBackground = makeImageUrl(
      cloudName,
      publicId,
      "e_background_removal",
    );
    const mirrored = makeImageUrl(
      cloudName,
      publicId,
      "e_background_removal/a_hflip",
    );

    const variants = config.colors.map((color) => {
      const colorized = makeImageUrl(
        cloudName,
        publicId,
        `e_background_removal/e_colorize:30,co_rgb:${color.code}`,
      );

      return {
        color: color.name,
        colorCode: `#${color.code}`,
        images: [noBackground, colorized, mirrored],
        sizes: config.sizes.map((size) => ({
          size,
          stock: Math.floor(Math.random() * 50) + 10,
          sku: `${product.slug}-${color.name.toLowerCase()}-${size.toLowerCase().replace(/\s+/g, "-")}`,
          price: product.price,
        })),
      };
    });

    bulkOps.push({
      updateOne: {
        filter: { _id: product._id },
        update: {
          $set: {
            image: noBackground,
            variants,
          },
        },
      },
    });
  }

  if (bulkOps.length > 0) {
    const result = await Product.bulkWrite(bulkOps);
    console.log(`Updated ${result.modifiedCount} products`);
  }

  console.log(`Skipped ${skipped} products`);
  await mongoose.disconnect();
  console.log("Disconnected from database");
}

migrate().catch((error) => {
  console.error(error);
  process.exit(1);
});
