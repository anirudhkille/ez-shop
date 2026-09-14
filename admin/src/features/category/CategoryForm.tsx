"use client";

import React from "react";
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
import { ImageUpload } from "@/components/shared/ImageUpload";
import { clientFetch } from "@/lib/client-api";
import { generateSlug } from "@/lib/slug";
import { ICategory } from "@/types";

interface CategoryFormProps {
  data?: ICategory | null;
}

const formSchema = z.object({
  name: z.string().min(1, { message: "Please enter a category name" }),
  slug: z.string().min(1, { message: "Slug is required" }),
  image: z.array(z.string()).min(1, { message: "Please upload an image" }),
});

type FormValues = z.infer<typeof formSchema>;

export default function CategoryForm({ data }: CategoryFormProps) {
  const router = useRouter();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: data?.name || "",
      slug: data?.slug || "",
      image: data?.image ? [data.image] : [],
    },
  });

  const watchName = form.watch("name");

  React.useEffect(() => {
    if (!data && watchName) {
      form.setValue("slug", generateSlug(watchName));
    }
  }, [watchName, data, form]);

  const onSubmit = async (values: FormValues) => {
    try {
      const payload = {
        name: values.name,
        slug: values.slug,
        image: values.image[0] || "",
      };

      const response = await clientFetch(
        data ? `/api/category/${data._id}` : "/api/category",
        {
          method: data ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

      const result = await response.json();

      if (result.success) {
        toast.success(result.message);
        router.push("/dashboard/category");
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
                <Input placeholder="Enter category name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Slug</FormLabel>
              <FormControl>
                <Input placeholder="category-slug" {...field} />
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
