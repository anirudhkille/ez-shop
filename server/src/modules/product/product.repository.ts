import Product, { IProduct } from "@/modules/product/product.model";
import {
  atlasSearchEnabled,
  buildAtlasSearchStage,
  buildPrefixSearchFilter,
  buildTextSearchFilter,
  buildTextSearchSort,
  isAtlasSearchUnavailable,
} from "@/modules/product/product.search";
import { QueryFilter, PipelineStage, Types, UpdateQuery } from "mongoose";
import { logger } from "@/config/logger";

const FILTERED_SELECT =
  "name slug image imageAlt tag price discountPrice rating reviewsCount category variants.colorCode";

const FILTERED_PROJECTION: PipelineStage.Project["$project"] = {
  name: 1,
  slug: 1,
  image: 1,
  imageAlt: 1,
  tag: 1,
  price: 1,
  discountPrice: 1,
  rating: 1,
  reviewsCount: 1,
  category: 1,
  "variants.colorCode": 1,
};

const CATEGORY_LOOKUP: PipelineStage.Lookup = {
  $lookup: {
    from: "categories",
    localField: "category",
    foreignField: "_id",
    as: "category",
    pipeline: [{ $project: { name: 1 } }],
  },
};

const CATEGORY_UNWIND: PipelineStage.Unwind = {
  $unwind: { path: "$category", preserveNullAndEmptyArrays: true },
};

let atlasFallbackLoggedAt = 0;
const ATLAS_FALLBACK_LOG_INTERVAL_MS = 5 * 60 * 1000;

const warnAtlasFallback = (error: unknown) => {
  const now = Date.now();
  if (now - atlasFallbackLoggedAt < ATLAS_FALLBACK_LOG_INTERVAL_MS) return;
  atlasFallbackLoggedAt = now;

  logger.warn(
    { err: error instanceof Error ? error.message : String(error) },
    "Atlas Search is unavailable; falling back to local search",
  );
};

export const create = async (
  data: Partial<IProduct> & { variantImageMap?: unknown },
) => {
  return await Product.create(data);
};

export const find = async (
  filter: QueryFilter<IProduct>,
  skip: number,
  limit: number,
) => {
  return await Product.find(filter)
    .sort({ createdAt: -1, _id: 1 })
    .skip(skip)
    .limit(limit)
    .populate("category");
};

export const countDocuments = async (filter: QueryFilter<IProduct>) => {
  return await Product.countDocuments(filter);
};

export const findById = async (id: string | Types.ObjectId) => {
  return await Product.findById(id).populate("category");
};

export const findByIds = async (ids: (string | Types.ObjectId)[]) => {
  return await Product.find({
    _id: { $in: ids.map((id) => new Types.ObjectId(id)) },
  });
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

const findSearchAtlas = async (keyword: string, limit: number) => {
  return await Product.aggregate([
    buildAtlasSearchStage(keyword),
    { $match: { publish: true } },
    { $limit: limit },
    CATEGORY_LOOKUP,
    CATEGORY_UNWIND,
    { $project: FILTERED_PROJECTION },
  ]);
};

const findSearchPrefix = async (keyword: string, limit: number) => {
  return await Product.find({
    ...buildPrefixSearchFilter(keyword),
    publish: true,
  })
    .select(FILTERED_SELECT)
    .populate("category", "name")
    .sort({ createdAt: -1, _id: 1 })
    .limit(limit);
};

const findSearchText = async (keyword: string, limit: number) => {
  return await Product.find(
    { ...buildTextSearchFilter(keyword), publish: true },
    { ...FILTERED_PROJECTION, score: { $meta: "textScore" } },
  )
    .sort(buildTextSearchSort({}))
    .populate("category", "name")
    .limit(limit);
};

export const findSearch = async (keyword: string, limit: number) => {
  if (atlasSearchEnabled()) {
    try {
      return await findSearchAtlas(keyword, limit);
    } catch (error) {
      if (!isAtlasSearchUnavailable(error)) throw error;

      warnAtlasFallback(error);
    }
  }

  const prefixMatches = await findSearchPrefix(keyword, limit);

  if (prefixMatches.length > 0 || keyword.length < 2) {
    return prefixMatches;
  }

  return await findSearchText(keyword, limit);
};

export const findFiltered = async (
  query: QueryFilter<IProduct>,
  sortOption: Record<string, 1 | -1>,
  skip: number,
  limit: number,
) => {
  return await Product.find(query)
    .select(FILTERED_SELECT)
    .populate({ path: "category", select: "name" })
    .sort(sortOption)
    .skip(skip)
    .limit(limit)
    .lean();
};

const findFilteredSearchAtlas = async (
  search: string,
  filter: QueryFilter<IProduct>,
  sortOption: Record<string, 1 | -1>,
  skip: number,
  limit: number,
) => {
  const pipeline: PipelineStage[] = [
    buildAtlasSearchStage(search),
    { $match: filter },
    { $addFields: { searchScore: { $meta: "searchScore" } } },
    { $sort: { searchScore: -1, ...sortOption } },
    { $skip: skip },
    { $limit: limit },
    CATEGORY_LOOKUP,
    CATEGORY_UNWIND,
    { $project: FILTERED_PROJECTION },
  ];
  const countPipeline: PipelineStage[] = [
    buildAtlasSearchStage(search),
    { $match: filter },
    { $count: "total" },
  ];

  const [items, count] = await Promise.all([
    Product.aggregate(pipeline),
    Product.aggregate<{ total: number }>(countPipeline),
  ]);

  return { items, total: count[0]?.total ?? 0 };
};

const findFilteredSearchText = async (
  search: string,
  filter: QueryFilter<IProduct>,
  sortOption: Record<string, 1 | -1>,
  skip: number,
  limit: number,
) => {
  const textFilter = {
    ...filter,
    ...buildTextSearchFilter(search),
  } as QueryFilter<IProduct>;

  const [items, total] = await Promise.all([
    Product.find(textFilter, {
      ...FILTERED_PROJECTION,
      score: { $meta: "textScore" },
    })
      .populate({ path: "category", select: "name" })
      .sort(buildTextSearchSort(sortOption))
      .skip(skip)
      .limit(limit)
      .lean(),
    Product.countDocuments(textFilter),
  ]);

  return { items, total };
};

export const findFilteredSearch = async (
  search: string,
  filter: QueryFilter<IProduct>,
  sortOption: Record<string, 1 | -1>,
  skip: number,
  limit: number,
) => {
  if (atlasSearchEnabled()) {
    try {
      return await findFilteredSearchAtlas(
        search,
        filter,
        sortOption,
        skip,
        limit,
      );
    } catch (error) {
      if (!isAtlasSearchUnavailable(error)) throw error;

      warnAtlasFallback(error);
    }
  }

  return await findFilteredSearchText(search, filter, sortOption, skip, limit);
};

export const findFeatured = async () => {
  return await Product.find({ publish: true, isFeatured: true })
    .select(
      "name slug image imageAlt reviewsCount rating tag category price discountPrice",
    )
    .populate({ path: "category", select: "name" })
    .limit(8)
    .lean();
};

export const findBestSellers = async () => {
  return await Product.find({ publish: true, isBestSellers: true })
    .select("name slug image imageAlt rating price discountPrice")
    .limit(6)
    .lean();
};

export const findSimilar = async (id: string, categoryId: Types.ObjectId) => {
  return await Product.find({
    _id: { $ne: new Types.ObjectId(id) },
    category: categoryId,
    publish: true,
  })
    .select(
      "name slug image imageAlt reviewsCount rating tag category price discountPrice",
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

export const findFacets = async (match: QueryFilter<IProduct>) => {
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
