"use client";

import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";

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
import PublishDropdown from "@/components/shared/PublishDropdown";
import { ImageUpload } from "@/components/shared/ImageUpload";
import { clientFetch } from "@/lib/client-api";
import { ICategory, IProduct } from "@/types";

interface ProductFormProps {
  data?: IProduct | null;
}

const formSchema = z.object({
  name: z.string().min(1, { message: "Please enter a product name" }),
  description: z.string().min(1, { message: "Please enter a description" }),
  price: z.number().positive("Price must be a positive number"),
  discountPrice: z.number().optional(),
  stock: z.number().int().min(0, "Stock must be 0 or more"),
  category: z.string().min(1, "Please select a category"),
  image: z.array(z.string()).min(1, { message: "Please upload an image" }),
  publish: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

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
    },
  });

  useEffect(() => {
    clientFetch("/api/category")
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
        variants: [],
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
                  initialImages={field.value}
                  onUploadSuccess={(urls) => field.onChange(urls)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full">
          Save
        </Button>
      </form>
    </Form>
  );
}
