import { generateSlug } from "@/lib/slug";
import mongoose from "mongoose";

export interface ICategory {
  _id: mongoose.Types.ObjectId;
  image: string;
  title: string;
  publish: boolean;
  slug: string;
}

const categorySchema = new mongoose.Schema<ICategory>(
  {
    image: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    publish: {
      type: Boolean,
      required: true,
    },
    slug: {
      type: String,
      unique: true,
    },
  },
  { timestamps: true }
);

categorySchema.pre("save", async function (next) {
  const category = this;
  if (!category.isModified("title")) {
    return next();
  }

  let baseSlug = generateSlug(category.title);
  let uniqueSlug = baseSlug;
  let counter = 1;

  while (await Category.exists({ slug: uniqueSlug })) {
    uniqueSlug = `${baseSlug}-${counter}`;
    counter++;
  }

  category.slug = uniqueSlug;
  next();
});

categorySchema.pre("findOneAndUpdate", async function (next) {
  const query = this.getQuery();
  const update = this.getUpdate() as ICategory;

  if (!update.title) {
    return next();
  }

  let baseSlug = generateSlug(update.title);
  let uniqueSlug = baseSlug;
  let counter = 1;

  while (await Category.exists({ slug: uniqueSlug })) {
    uniqueSlug = `${baseSlug}-${counter}`;
    counter++;
  }

  update.slug = uniqueSlug;
  next();
});

const Category =
  mongoose.models.Category || mongoose.model("Category", categorySchema);

export default Category;
