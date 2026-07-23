import Product from "@/modules/product/product.model";

export const create = async (data: any) => {
  return await Product.create(data);
};

export const find = async (filter: any, skip: number, limit: number) => {
  return await Product.find(filter).skip(skip).limit(limit).populate("category");
};

export const countDocuments = async (filter: any) => {
  return await Product.countDocuments(filter);
};

export const findById = async (id: string) => {
  return await Product.findById(id).populate("category");
};

export const findByIdAndUpdate = async (id: string, data: any) => {
  return await Product.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
};

export const findByIdAndDelete = async (id: string) => {
  const product = await Product.findById(id);
  if (product) await product.deleteOne();
  return product;
};

export const findSearch = async (keyword: string, limit: number) => {
  return await Product.find({
    name: { $regex: keyword, $options: "i" },
  }).populate("category","name").limit(limit);
};

export const findFiltered = async (
  query: any,
  sortOption: any,
  skip: number,
  limit: number,
) => {
  return await Product.find(query).sort(sortOption).skip(skip).limit(limit).lean();
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

export const findSimilar = async (id: string, categoryId: any) => {
  return await Product.find({
    _id: { $ne: id },
    category: categoryId,
    publish: true,
  })
    .select("name slug image reviewsCount rating tag category price discountPrice")
    .limit(4)
    .lean();
};

export const findByIdSelect = async (id: string, select: string) => {
  return await Product.findById(id).select(select).lean();
};
