"use client";

import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { useForm, useFieldArray, Control } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PublishDropdown from "@/components/shared/PublishDropdown";
import { ImageUpload } from "@/components/shared/ImageUpload";
import { clientFetch } from "@/lib/client-api";
import { ICategory, IProduct } from "@/types";

interface ProductFormProps {
  data?: IProduct | null;
}

const variantSizeSchema = z.object({
  size: z.string().min(1, "Size is required"),
  stock: z.number().int().min(0, "Stock must be 0 or more"),
  sku: z.string().optional(),
  price: z.number().optional(),
  discountPrice: z.number().optional(),
});

const variantSchema = z.object({
  color: z.string().min(1, "Color is required"),
  colorCode: z.string().optional(),
  images: z.array(z.string()),
  sizes: z.array(variantSizeSchema),
});

const formSchema = z.object({
  name: z.string().min(1, { message: "Please enter a product name" }),
  description: z.string().min(1, { message: "Please enter a description" }),
  price: z.number().positive("Price must be a positive number"),
  discountPrice: z.number().optional(),
  stock: z.number().int().min(0, "Stock must be 0 or more"),
  category: z.string().min(1, "Please select a category"),
  image: z.array(z.string()).min(1, { message: "Please upload an image" }),
  publish: z.boolean(),
  gender: z.enum(["men", "women", "unisex"]),
  isFeatured: z.boolean(),
  isBestSellers: z.boolean(),
  tag: z.enum(["Best Seller", "Trending", "Limited", "New", "Hot", "Sale"]),
  variants: z.array(variantSchema),
});

type FormValues = z.infer<typeof formSchema>;

function SizesFields({
  control,
  variantIndex,
}: {
  control: Control<FormValues>;
  variantIndex: number;
}) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `variants.${variantIndex}.sizes`,
  });

  return (
    <div className="space-y-3">
      <div className="text-sm font-medium">Sizes</div>
      {fields.length === 0 && (
        <p className="text-sm text-muted-foreground">No sizes added yet.</p>
      )}
      {fields.map((field, sizeIndex) => (
        <div key={field.id} className="grid gap-2 sm:grid-cols-6 items-end">
          <FormField
            control={control}
            name={`variants.${variantIndex}.sizes.${sizeIndex}.size`}
            render={({ field }) => (
              <FormItem className="sm:col-span-1">
                <FormControl>
                  <Input placeholder="Size" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name={`variants.${variantIndex}.sizes.${sizeIndex}.stock`}
            render={({ field }) => (
              <FormItem className="sm:col-span-1">
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Stock"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name={`variants.${variantIndex}.sizes.${sizeIndex}.sku`}
            render={({ field }) => (
              <FormItem className="sm:col-span-1">
                <FormControl>
                  <Input placeholder="SKU" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name={`variants.${variantIndex}.sizes.${sizeIndex}.price`}
            render={({ field }) => (
              <FormItem className="sm:col-span-1">
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Price"
                    {...field}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value ? Number(e.target.value) : 0,
                      )
                    }
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name={`variants.${variantIndex}.sizes.${sizeIndex}.discountPrice`}
            render={({ field }) => (
              <FormItem className="sm:col-span-1">
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Discount"
                    {...field}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value ? Number(e.target.value) : 0,
                      )
                    }
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => remove(sizeIndex)}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() =>
          append({ size: "", stock: 0, sku: "", price: 0, discountPrice: 0 })
        }
      >
        <Plus className="mr-1 size-4" /> Add Size
      </Button>
    </div>
  );
}

export default function ProductForm({ data }: ProductFormProps) {
  const router = useRouter();
  const [categories, setCategories] = useState<ICategory[]>([]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: data?.name || "",
      description: data?.description || "",
      price: data?.price || 0,
      discountPrice: data?.discountPrice || 0,
      stock: data?.stock || 0,
      category:
        typeof data?.category === "string"
          ? data.category
          : data?.category?._id || "",
      image: data?.image ? [data.image] : [],
      publish: data?.publish ?? true,
      gender: data?.gender || "unisex",
      isFeatured: data?.isFeatured ?? false,
      isBestSellers: data?.isBestSellers ?? false,
      tag: data?.tag || "New",
      variants: data?.variants
        ? JSON.parse(JSON.stringify(data.variants))
        : [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "variants",
  });

  useEffect(() => {
    clientFetch("/api/category?limit=1000")
      .then((res) => res.json())
      .then((result) => setCategories(result.data || []))
      .catch(() => toast.error("Failed to load categories"));
  }, []);

  const onSubmit = async (values: FormValues) => {
    try {
      const payload = {
        name: values.name,
        description: values.description,
        price: values.price,
        discountPrice: values.discountPrice || 0,
        stock: values.stock,
        category: values.category,
        publish: values.publish,
        image: values.image[0] || "",
        gender: values.gender,
        isFeatured: values.isFeatured,
        isBestSellers: values.isBestSellers,
        tag: values.tag,
        variants: values.variants,
      };

      const response = await clientFetch(
        data ? `/api/product/${data._id}` : "/api/product",
        {
          method: data ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

      const result = await response.json();

      if (result.success) {
        toast.success(result.message);
        router.push("/dashboard/products");
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An error occurred");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter product name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Input placeholder="Enter product description" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Enter price"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="discountPrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Discount Price</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Enter discount price"
                    {...field}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value ? Number(e.target.value) : 0,
                      )
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="stock"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Stock</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Enter stock quantity"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <FormControl>
                  <select
                    {...field}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                      <option key={category._id} value={category._id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="gender"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Gender</FormLabel>
                <FormControl>
                  <select
                    {...field}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="men">Men</option>
                    <option value="women">Women</option>
                    <option value="unisex">Unisex</option>
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="tag"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tag</FormLabel>
                <FormControl>
                  <select
                    {...field}
                    value={field.value || "New"}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="New">New</option>
                    <option value="Best Seller">Best Seller</option>
                    <option value="Trending">Trending</option>
                    <option value="Limited">Limited</option>
                    <option value="Hot">Hot</option>
                    <option value="Sale">Sale</option>
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex flex-wrap items-center gap-6">
          <FormField
            control={form.control}
            name="isFeatured"
            render={({ field }) => (
              <FormItem className="flex items-center gap-2 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel className="font-normal">Featured</FormLabel>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="isBestSellers"
            render={({ field }) => (
              <FormItem className="flex items-center gap-2 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel className="font-normal">Best Seller</FormLabel>
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="publish"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <PublishDropdown
                  value={field.value}
                  onChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="image"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <ImageUpload
                  key={data?._id ?? "new"}
                  initialImages={field.value}
                  onUploadSuccess={(urls) => field.onChange(urls)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Variants</h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                append({ color: "", colorCode: "", images: [], sizes: [] })
              }
            >
              <Plus className="mr-1 size-4" /> Add Variant
            </Button>
          </div>

          {fields.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No variants added yet.
            </p>
          )}

          {fields.map((field, index) => (
            <Card key={field.id}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Variant {index + 1}
                </CardTitle>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => remove(index)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name={`variants.${index}.color`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Color</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Red" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`variants.${index}.colorCode`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Color Code</FormLabel>
                        <FormControl>
                          <Input placeholder="#ff0000" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name={`variants.${index}.images`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Variant Images</FormLabel>
                      <FormControl>
                        <ImageUpload
                          initialImages={field.value}
                          onUploadSuccess={(urls) => field.onChange(urls)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <SizesFields control={form.control} variantIndex={index} />
              </CardContent>
            </Card>
          ))}
        </div>

        <Button type="submit" className="w-full">
          Save
        </Button>
      </form>
    </Form>
  );
}
