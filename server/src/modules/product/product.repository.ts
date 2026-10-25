import Product, { IProduct } from "@/modules/product/product.model";
import { FilterQuery, Types, UpdateQuery } from "mongoose";

export const create = async (
  data: Partial<IProduct> & { variantImageMap?: unknown },
) => {
  return await Product.create(data);
};

export const find = async (
  filter: FilterQuery<IProduct>,
  skip: number,
  limit: number,
) => {
  return await Product.find(filter)
    .sort({ createdAt: -1, _id: 1 })
    .skip(skip)
    .limit(limit)
    .populate("category");
};

export const countDocuments = async (filter: FilterQuery<IProduct>) => {
  return await Product.countDocuments(filter);
};

export const findById = async (id: string | Types.ObjectId) => {
  return await Product.findById(id).populate("category");
};

export const findByIds = async (ids: (string | Types.ObjectId)[]) => {
  return await Product.find({ _id: { $in: ids } });
};

/** Atomic decrement, bypassing the update validators. */
export const decrementStock = async (
  id: string | Types.ObjectId,
  quantity: number,
) => {
  return await Product.updateOne({ _id: id }, { $inc: { stock: -quantity } });
};

export const findByIdAndUpdate = async (
  id: string | Types.ObjectId,
  data: UpdateQuery<IProduct>,
) => {
  return await Product.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
};

export const findByIdAndDelete = async (id: string | Types.ObjectId) => {
  const product = await Product.findById(id);
  if (product) await product.deleteOne();
  return product;
};

export const findSearch = async (keyword: string, limit: number) => {
  return await Product.find({
    name: { $regex: keyword, $options: "i" },
  })
    .populate("category", "name")
    .limit(limit);
};

export const findFiltered = async (
  query: FilterQuery<IProduct>,
  sortOption: Record<string, 1 | -1>,
  skip: number,
  limit: number,
) => {
  return await Product.find(query)
    .select(
      "name slug image tag price discountPrice rating reviewsCount category variants.colorCode",
    )
    .populate({ path: "category", select: "name" })
    .sort(sortOption)
    .skip(skip)
    .limit(limit)
    .lean();
};

export const findFeatured = async () => {
  return await Product.find({ publish: true, isFeatured: true })
    .select(
      "name slug image reviewsCount rating tag category price discountPrice",
    )
    .populate({ path: "category", select: "name" })
    .limit(8)
    .lean();
};

export const findBestSellers = async () => {
  return await Product.find({ publish: true, isBestSellers: true })
    .select("name slug image rating price discountPrice")
    .limit(6)
    .lean();
};

export const findSimilar = async (id: string, categoryId: Types.ObjectId) => {
  return await Product.find({
    _id: { $ne: id },
    category: categoryId,
    publish: true,
  })
    .select(
      "name slug image reviewsCount rating tag category price discountPrice",
    )
    .limit(4)
    .lean();
};

export const findByIdSelect = async (id: string, select: string) => {
  return await Product.findById(id).select(select).lean();
};

interface ProductFacetsAggregation {
  price: { min?: number; max?: number }[];
  sizes: { _id?: string }[];
  colors: { _id?: string; colorCode?: string }[];
  ratings: { max?: number }[];
}

export const findFacets = async (match: FilterQuery<IProduct>) => {
  const effectivePrice = {
    $cond: [
      { $gt: [{ $ifNull: ["$discountPrice", 0] }, 0] },
      "$discountPrice",
      "$price",
    ],
  };

  const [facets] = await Product.aggregate<ProductFacetsAggregation>([
    { $match: match },
    {
      $facet: {
        price: [
          {
            $group: {
              _id: null,
              min: { $min: effectivePrice },
              max: { $max: effectivePrice },
            },
          },
        ],
        sizes: [
          { $unwind: "$variants" },
          { $unwind: "$variants.sizes" },
          { $group: { _id: "$variants.sizes.size" } },
        ],
        colors: [
          { $unwind: "$variants" },
          {
            $group: {
              _id: "$variants.color",
              colorCode: { $first: "$variants.colorCode" },
            },
          },
        ],
        ratings: [{ $group: { _id: null, max: { $max: "$rating" } } }],
      },
    },
  ]);

  return facets;
};
