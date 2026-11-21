import { z } from "zod";

const optionalText = (max: number) => z.string().trim().max(max).optional();

const imageUrlSchema = z
  .string()
  .trim()
  .url()
  .refine((value) => /^https?:\/\//i.test(value), {
    message: "Image must be an http(s) URL",
  });

const productTagSchema = z.enum([
  "Best Seller",
  "Trending",
  "Limited",
  "New",
  "Hot",
  "Sale",
]);

const productGenderSchema = z.enum(["men", "women", "unisex"]);

export const productStudioInputSchema = z
  .object({
    name: optionalText(120),
    description: optionalText(2_000),
    category: optionalText(120),
    gender: productGenderSchema.optional(),
    price: z.number().positive().optional(),
    discountPrice: z.number().positive().optional(),
    tag: productTagSchema.optional(),
    colors: z.array(z.string().trim().min(1).max(40)).max(10).optional(),
    sizes: z.array(z.string().trim().min(1).max(20)).max(20).optional(),
    image: imageUrlSchema.optional(),
    brief: optionalText(600),
    tone: z.enum(["professional", "playful", "minimal", "premium"]).optional(),
  })
  .refine((value) => Boolean(value.name || value.description || value.image), {
    message: "Provide a product name, description, or image.",
  });

export const productStudioOutputSchema = z.object({
  name: z.string().trim().min(1).max(120),
  description: z.string().trim().min(20).max(1_200),
  tag: productTagSchema,
  gender: productGenderSchema,
  imageAlt: z.string().trim().min(5).max(160),
  seoTitle: z.string().trim().min(10).max(70),
  seoDescription: z.string().trim().min(50).max(160),
  keywords: z.array(z.string().trim().min(1).max(60)).min(3).max(10),
});

export type ProductStudioInput = z.infer<typeof productStudioInputSchema>;
export type ProductStudioOutput = z.infer<typeof productStudioOutputSchema>;
