import "dotenv/config";

import mongoose from "mongoose";
import slugify from "slugify";

import Category from "../src/modules/category/category.model";
import Product from "../src/modules/product/product.model";

const IMAGES = {
  headphones:
    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
  smartwatch:
    "https://images.unsplash.com/photo-1523275335684-8f982e9a7f3a?auto=format&fit=crop&w=800&q=80",
  speaker:
    "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=800&q=80",
  camera:
    "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=800&q=80",
  earbuds:
    "https://res.cloudinary.com/dgkzfogba/image/upload/v1789368875/ez-shop/products/mrsvc6rvm73yrpgw6upu.jpg",
  denimJacket:
    "https://res.cloudinary.com/dgkzfogba/image/upload/v1789368776/ez-shop/products/yqtlqzajv2umbp0nyrsb.jpg",
  tShirt:
    "https://res.cloudinary.com/dgkzfogba/image/upload/v1789368789/ez-shop/products/yj8csuf2iajtvsxydavg.jpg",
  chinos:
    "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=800&q=80",
  crossbodyBag:
    "https://res.cloudinary.com/dgkzfogba/image/upload/v1789368751/ez-shop/products/ts99uxylcx81ecrrw7vp.jpg",
  runningSneaker:
    "https://res.cloudinary.com/dgkzfogba/image/upload/v1789368766/ez-shop/products/pkxc3o7r7m8brjv0ph1r.jpg",
  mug: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&w=800&q=80",
  cookware:
    "https://images.unsplash.com/photo-1584990347449-a2d4c2c044c7?auto=format&fit=crop&w=800&q=80",
  cuttingBoard:
    "https://images.unsplash.com/photo-1584269600519-112d071b35e6?auto=format&fit=crop&w=800&q=80",
  candle:
    "https://images.unsplash.com/photo-1602825269966-1a1eb5f4c56f?auto=format&fit=crop&w=800&q=80",
  lamp: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80",
  serum:
    "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80",
  lipstick:
    "https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=800&q=80",
  lotion:
    "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=800&q=80",
  beardKit:
    "https://images.unsplash.com/photo-1621607512214-68297480165e?auto=format&fit=crop&w=800&q=80",
  perfume:
    "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=800&q=80",
  yogaMat:
    "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?auto=format&fit=crop&w=800&q=80",
  dumbbells:
    "https://images.unsplash.com/photo-1638536532686-d610adfc8e5c?auto=format&fit=crop&w=800&q=80",
  waterBottle:
    "https://images.unsplash.com/photo-1602143407151-01114192003f?auto=format&fit=crop&w=800&q=80",
  runningBelt:
    "https://res.cloudinary.com/dgkzfogba/image/upload/v1789368775/ez-shop/products/xvqibgzbtypzzt3gpsdi.jpg",
  tent: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=800&q=80",
  avocado:
    "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?auto=format&fit=crop&w=800&q=80",
  bread:
    "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80",
  oliveOil:
    "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=800&q=80",
  nuts: "https://images.unsplash.com/photo-1606923829579-0cb981a83e2e?auto=format&fit=crop&w=800&q=80",
  juice:
    "https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=800&q=80",
  whiteSneaker:
    "https://res.cloudinary.com/dgkzfogba/image/upload/v1789368764/ez-shop/products/hlr83bcynfqobzjlfynm.jpg",
  canvasSneakers:
    "https://res.cloudinary.com/dgkzfogba/image/upload/v1789368765/ez-shop/products/cnnwomrbc23w1adtcalh.jpg",
  hikingBoots:
    "https://res.cloudinary.com/dgkzfogba/image/upload/v1789368782/ez-shop/products/poizdalndjd6gwciykpj.jpg",
  wristWatch:
    "https://res.cloudinary.com/dgkzfogba/image/upload/v1789368784/ez-shop/products/dtu24pnlyi6fxcfblido.jpg",
  sunglasses:
    "https://res.cloudinary.com/dgkzfogba/image/upload/v1789368789/ez-shop/products/nsvmyuu50yqdwv3c95fy.jpg",
  wallet:
    "https://res.cloudinary.com/dgkzfogba/image/upload/v1789368781/ez-shop/products/jjug78fgtl1xkkjptsc2.jpg",
  backpack:
    "https://res.cloudinary.com/dgkzfogba/image/upload/v1789368769/ez-shop/products/yqchyhfbfujv8w6uhtqw.jpg",
  dress:
    "https://res.cloudinary.com/dgkzfogba/image/upload/v1789368778/ez-shop/products/f0kkejrvaghtfmkhrrz2.jpg",
  handbag:
    "https://res.cloudinary.com/dgkzfogba/image/upload/v1789368753/ez-shop/products/f8ipb8t4rws9hmbylern.jpg",
  heels:
    "https://res.cloudinary.com/dgkzfogba/image/upload/v1789368754/ez-shop/products/malaksfhynadat0kagxd.jpg",
  cap: "https://res.cloudinary.com/dgkzfogba/image/upload/v1789368783/ez-shop/products/lt595ijhzxrwfknurrvw.jpg",
  shorts:
    "https://res.cloudinary.com/dgkzfogba/image/upload/v1789368787/ez-shop/products/ok4lnejixnnkmmmxo4f8.jpg",
  hoodie:
    "https://res.cloudinary.com/dgkzfogba/image/upload/v1789368788/ez-shop/products/vgmqsjesv1y6yj7fqkth.jpg",
  genericProduct:
    "https://res.cloudinary.com/dgkzfogba/image/upload/v1789368758/ez-shop/products/kibf3tvbfrc2b9bfklxq.jpg",
};

const categoriesSeed = [
  {
    name: "Shoes",
    slug: "shoes",
    image: IMAGES.whiteSneaker,
  },
  {
    name: "Accessories",
    slug: "accessories",
    image: IMAGES.wristWatch,
  },
  {
    name: "Men",
    slug: "men",
    image: IMAGES.hoodie,
  },
  {
    name: "Clothing",
    slug: "clothing",
    image: IMAGES.tShirt,
  },
  {
    name: "Women",
    slug: "women",
    image: IMAGES.handbag,
  },
  {
    name: "Kids",
    slug: "kids",
    image: IMAGES.cap,
  },
];

interface ProductSeed {
  name: string;
  description: string;
  price: number;
  discountPrice?: number;
  image: string;
  stock: number;
  tag: string;
  isFeatured?: boolean;
  isBestSellers?: boolean;
}

const product = (
  name: string,
  description: string,
  price: number,
  image: string,
  stock: number,
  tag: string,
  discountPrice?: number,
): ProductSeed => ({
  name,
  description,
  price,
  image,
  stock,
  tag,
  ...(discountPrice !== undefined && { discountPrice }),
});

const productsSeed: { categorySlug: string; items: ProductSeed[] }[] = [
  {
    categorySlug: "shoes",
    items: [
      product(
        "Lightweight Running Shoes",
        "Breathable mesh upper with responsive cushioning for daily runs.",
        89,
        IMAGES.whiteSneaker,
        56,
        "Best Seller",
        79,
      ),
      product(
        "Canvas Sneakers",
        "Classic low-top canvas sneakers with a durable rubber sole.",
        59,
        IMAGES.canvasSneakers,
        72,
        "New",
      ),
      product(
        "Hiking Boots",
        "Water-resistant leather boots with ankle support and rugged outsoles.",
        139,
        IMAGES.hikingBoots,
        22,
        "Trending",
        119,
      ),
      product(
        "Casual Loafers",
        "Slip-on loafers with a cushioned insole for all-day comfort.",
        79,
        IMAGES.crossbodyBag,
        35,
        "Hot",
      ),
      product(
        "Sport Sandals",
        "Adjustable outdoor sandals with grippy soles and quick-dry straps.",
        45,
        IMAGES.shorts,
        48,
        "Sale",
        39,
      ),
      product(
        "Athletic Training Shoes",
        "Supportive trainers built for gym sessions and cross-training.",
        99,
        IMAGES.runningSneaker,
        40,
        "New",
        89,
      ),
      product(
        "Leather Chelsea Boots",
        "Sleek ankle boots with elastic side panels and a sturdy sole.",
        129,
        IMAGES.hikingBoots,
        18,
        "Limited",
      ),
      product(
        "Comfy Walking Shoes",
        "Cushioned walking shoes for everyday errands and long strolls.",
        69,
        IMAGES.whiteSneaker,
        64,
        "Best Seller",
        59,
      ),
      product(
        "Performance Soccer Cleats",
        "Lightweight cleats designed for speed and ball control.",
        109,
        IMAGES.canvasSneakers,
        30,
        "Trending",
      ),
      product(
        "Retro High-Top Sneakers",
        "Vintage-style high-tops with bold color blocking.",
        79,
        IMAGES.runningSneaker,
        45,
        "Hot",
      ),
    ],
  },
  {
    categorySlug: "accessories",
    items: [
      product(
        "Classic Wrist Watch",
        "Minimalist analog watch with a stainless steel case and leather strap.",
        99,
        IMAGES.wristWatch,
        40,
        "Best Seller",
        89,
      ),
      product(
        "Polarized Sunglasses",
        "UV400 protection sunglasses with a lightweight metal frame.",
        49,
        IMAGES.sunglasses,
        65,
        "Trending",
      ),
      product(
        "Leather Wallet",
        "Slim bifold wallet crafted from genuine leather with RFID blocking.",
        39,
        IMAGES.wallet,
        80,
        "New",
        34,
      ),
      product(
        "Canvas Backpack",
        "Durable everyday backpack with padded laptop compartment.",
        69,
        IMAGES.backpack,
        45,
        "Hot",
      ),
      product(
        "Braided Leather Belt",
        "Woven leather belt with a brushed metal buckle.",
        29,
        IMAGES.runningBelt,
        55,
        "Sale",
        25,
      ),
      product(
        "Smart Fitness Band",
        "Track steps, heart rate, and sleep with a slim fitness band.",
        59,
        IMAGES.wristWatch,
        50,
        "New",
      ),
      product(
        "Leather Passport Holder",
        "Slim travel wallet for passports, cards, and boarding passes.",
        34,
        IMAGES.wallet,
        60,
        "Limited",
        29,
      ),
      product(
        "Travel Duffel Bag",
        "Spacious duffel bag with detachable shoulder strap.",
        89,
        IMAGES.backpack,
        28,
        "Trending",
      ),
      product(
        "Metal Cufflinks",
        "Polished metal cufflinks for formal shirts and special occasions.",
        24,
        IMAGES.wristWatch,
        90,
        "Hot",
      ),
      product(
        "Wireless Earbuds Case",
        "Protective silicone case for wireless earbuds.",
        14,
        IMAGES.earbuds,
        120,
        "New",
      ),
    ],
  },
  {
    categorySlug: "men",
    items: [
      product(
        "Bomber Jacket",
        "Lightweight bomber jacket with ribbed cuffs and a modern fit.",
        109,
        IMAGES.hoodie,
        28,
        "Trending",
        94,
      ),
      product(
        "Casual Polo Shirt",
        "Soft cotton pique polo shirt in a regular fit.",
        39,
        IMAGES.genericProduct,
        60,
        "New",
      ),
      product(
        "Slim Fit Trousers",
        "Tailored slim trousers with a hint of stretch for comfort.",
        59,
        IMAGES.shorts,
        44,
        "Hot",
        49,
      ),
      product(
        "Chronograph Watch",
        "Bold chronograph watch with a stainless steel bracelet.",
        149,
        IMAGES.wristWatch,
        20,
        "Limited",
      ),
      product(
        "Aviator Sunglasses",
        "Timeless aviator sunglasses with mirrored lenses.",
        59,
        IMAGES.sunglasses,
        50,
        "Sale",
        49,
      ),
      product(
        "Formal Dress Shirt",
        "Crisp cotton dress shirt perfect for office and evening wear.",
        49,
        IMAGES.tShirt,
        55,
        "Best Seller",
      ),
      product(
        "Merino Wool Sweater",
        "Soft merino sweater that regulates temperature year-round.",
        79,
        IMAGES.hoodie,
        32,
        "Trending",
        69,
      ),
      product(
        "Chino Shorts",
        "Versatile chino shorts with a relaxed yet tailored fit.",
        34,
        IMAGES.shorts,
        70,
        "New",
      ),
      product(
        "Leather Belt",
        "Classic leather belt with a polished silver-tone buckle.",
        39,
        IMAGES.runningBelt,
        48,
        "Hot",
      ),
      product(
        "Crew Neck Sweatshirt",
        "Essential crew neck sweatshirt in a soft cotton blend.",
        49,
        IMAGES.hoodie,
        66,
        "Sale",
        42,
      ),
    ],
  },
  {
    categorySlug: "clothing",
    items: [
      product(
        "Essential Cotton T-Shirt",
        "Everyday crew neck tee made from breathable organic cotton.",
        25,
        IMAGES.tShirt,
        110,
        "Best Seller",
        21,
      ),
      product(
        "Pullover Hoodie",
        "Cozy fleece hoodie with kangaroo pocket and relaxed fit.",
        69,
        IMAGES.hoodie,
        48,
        "New",
      ),
      product(
        "Summer Dress",
        "Flowy midi dress with a flattering silhouette for warm days.",
        79,
        IMAGES.dress,
        36,
        "Trending",
        69,
      ),
      product(
        "Crossbody Bag",
        "Compact crossbody bag with adjustable strap and multiple pockets.",
        49,
        IMAGES.crossbodyBag,
        42,
        "Hot",
      ),
      product(
        "Printed Scarf",
        "Lightweight printed scarf to layer over any outfit.",
        29,
        IMAGES.dress,
        58,
        "Sale",
        24,
      ),
      product(
        "Denim Jacket",
        "Classic blue denim jacket with a vintage wash and relaxed fit.",
        89,
        IMAGES.denimJacket,
        30,
        "Best Seller",
      ),
      product(
        "Graphic Hoodie",
        "Streetwear hoodie with a bold front graphic print.",
        59,
        IMAGES.hoodie,
        40,
        "New",
      ),
      product(
        "Pleated Skirt",
        "Elegant pleated midi skirt with a comfortable elastic waist.",
        49,
        IMAGES.dress,
        35,
        "Trending",
        44,
      ),
      product(
        "Linen Shirt",
        "Breathable linen button-up shirt for warm-weather style.",
        55,
        IMAGES.tShirt,
        50,
        "Hot",
      ),
      product(
        "Wool Coat",
        "Tailored wool-blend coat with a clean silhouette.",
        149,
        IMAGES.hoodie,
        20,
        "Limited",
        129,
      ),
    ],
  },
  {
    categorySlug: "women",
    items: [
      product(
        "Tote Handbag",
        "Spacious structured tote with gold-tone hardware.",
        99,
        IMAGES.handbag,
        30,
        "Best Seller",
        84,
      ),
      product(
        "Stiletto Heels",
        "Elegant pointed-toe stilettos in classic black.",
        89,
        IMAGES.heels,
        25,
        "Trending",
      ),
      product(
        "Silk Scarf",
        "Luxurious silk scarf with a subtle geometric print.",
        35,
        IMAGES.dress,
        60,
        "New",
        29,
      ),
      product(
        "Oversized Sunglasses",
        "Chic oversized frames with full UV protection.",
        55,
        IMAGES.sunglasses,
        45,
        "Hot",
      ),
      product(
        "Floral Maxi Dress",
        "Floor-length floral dress with a cinched waist and flowy skirt.",
        95,
        IMAGES.dress,
        22,
        "Sale",
        85,
      ),
      product(
        "Clutch Wallet",
        "Sleek clutch wallet with card slots and a snap closure.",
        45,
        IMAGES.wallet,
        38,
        "New",
      ),
      product(
        "Ankle Boots",
        "Versatile ankle boots with a stacked heel and side zipper.",
        109,
        IMAGES.hikingBoots,
        28,
        "Best Seller",
        94,
      ),
      product(
        "Summer Hat",
        "Wide-brim straw hat with a breathable weave.",
        29,
        IMAGES.cap,
        55,
        "Trending",
      ),
      product(
        "Statement Necklace",
        "Bold necklace with layered chains and a polished finish.",
        39,
        IMAGES.wristWatch,
        42,
        "Hot",
      ),
      product(
        "Yoga Leggings",
        "High-waist leggings with four-way stretch and moisture-wicking fabric.",
        49,
        IMAGES.shorts,
        70,
        "New",
      ),
    ],
  },
  {
    categorySlug: "kids",
    items: [
      product(
        "Kids Graphic T-Shirt",
        "Soft cotton tee with a fun printed design for everyday play.",
        18,
        IMAGES.genericProduct,
        80,
        "New",
      ),
      product(
        "Kids Running Shoes",
        "Lightweight flexible sneakers built for active kids.",
        49,
        IMAGES.whiteSneaker,
        65,
        "Best Seller",
        42,
      ),
      product(
        "Kids School Backpack",
        "Colorful backpack with padded straps and multiple compartments.",
        35,
        IMAGES.backpack,
        55,
        "Hot",
      ),
      product(
        "Kids Baseball Cap",
        "Adjustable cotton cap with a curved brim.",
        16,
        IMAGES.cap,
        70,
        "Trending",
        13,
      ),
      product(
        "Kids Chino Shorts",
        "Comfortable cotton shorts with an adjustable waistband.",
        22,
        IMAGES.shorts,
        62,
        "New",
      ),
      product(
        "Kids Hoodie",
        "Cozy fleece hoodie for school days and weekend adventures.",
        34,
        IMAGES.hoodie,
        50,
        "New",
      ),
      product(
        "Kids Sandals",
        "Easy slip-on sandals with cushioned footbeds.",
        19,
        IMAGES.shorts,
        75,
        "Hot",
      ),
      product(
        "Kids Winter Jacket",
        "Insulated winter jacket with a fleece-lined hood.",
        59,
        IMAGES.hoodie,
        30,
        "Trending",
      ),
      product(
        "Kids Sunglasses",
        "Durable flexible sunglasses with UV protection.",
        12,
        IMAGES.sunglasses,
        90,
        "New",
      ),
      product(
        "Kids Pajama Set",
        "Soft cotton pajama set with a playful pattern.",
        24,
        IMAGES.tShirt,
        60,
        "Sale",
        19,
      ),
    ],
  },
];

async function seed() {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    throw new Error("MONGO_URI is not defined in the environment");
  }

  await mongoose.connect(uri);
  console.log("Connected to database");

  const existingCategories = await Category.find().lean();
  const categoryBySlug = new Map(
    existingCategories.map((category) => [category.slug, category]),
  );

  console.log(
    "Existing categories:",
    existingCategories.map((category) => category.name).join(", ") || "none",
  );

  for (const category of categoriesSeed) {
    if (!categoryBySlug.has(category.slug)) {
      const created = await Category.create(category);
      categoryBySlug.set(category.slug, created);
      console.log("Created category:", created.name);
    }
  }

  let totalInserted = 0;

  for (const group of productsSeed) {
    const category = categoryBySlug.get(group.categorySlug);

    if (!category) {
      console.warn("Category not found:", group.categorySlug);
      continue;
    }

    const existingSlugs = new Set(
      (
        await Product.find({ category: category._id }).select("slug").lean()
      ).map((product) => product.slug),
    );

    const itemsToInsert = group.items
      .filter(
        (item) =>
          !existingSlugs.has(slugify(item.name, { lower: true, strict: true })),
      )
      .map((item) => ({
        ...item,
        slug: slugify(item.name, { lower: true, strict: true }),
        category: category._id,
        rating: 0,
        reviewsCount: 0,
        publish: true,
      }));

    if (itemsToInsert.length === 0) {
      console.log("No new products for", group.categorySlug);
      continue;
    }

    await Product.insertMany(itemsToInsert);
    totalInserted += itemsToInsert.length;
    console.log(
      `Inserted ${itemsToInsert.length} product(s) into ${group.categorySlug}`,
    );
  }

  console.log(`Total products inserted: ${totalInserted}`);
  await mongoose.disconnect();
  console.log("Disconnected from database");
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
