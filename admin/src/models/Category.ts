import { generateSlug } from "@/lib/slug";
import mongoose, { type Document, type Model } from "mongoose";

export interface ICategory extends Document {
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

const generateUniqueSlug = async (
  baseSlug: string,
  Category: Model<ICategory>
): Promise<string> => {
  let uniqueSlug = baseSlug;
  let counter = 1;

  while (await Category.exists({ slug: uniqueSlug })) {
    uniqueSlug = `${baseSlug}-${counter}`;
    counter++;
  }

  return uniqueSlug;
};

categorySchema.pre("save", async function (next) {
  if (!this.isModified("title")) return next();

  const baseSlug = generateSlug(this.title);
  this.slug = await generateUniqueSlug(
    baseSlug,
    this.constructor as Model<ICategory>
  );
  next();
});

categorySchema.pre("findOneAndUpdate", async function (next) {
  const update = this.getUpdate() as Partial<ICategory>;

  if (!update.title) return next();

  const baseSlug = generateSlug(update.title);
  update.slug = await generateUniqueSlug(
    baseSlug,
    this.model as Model<ICategory>
  );
  next();
});

const Category =
  mongoose.models.Category ||
  mongoose.model<ICategory>("Category", categorySchema);

export default Category;
