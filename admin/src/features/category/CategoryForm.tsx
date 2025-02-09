"use client";
import React from "react";
import { toast } from "sonner";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

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

import { ICategory } from "@/models/Category";
import { useRouter } from "next/navigation";

interface CategoryFormProps {
  data?: ICategory | null;
}

const formSchema = z.object({
  title: z.string().nonempty({ message: "Please enter a title" }),
  image: z.string().nonempty({ message: "Please upload an image" }),
  publish: z.boolean(),
});

export default function CategoryForm({ data }: CategoryFormProps) {
  const router = useRouter();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: data?.title || "",
      image: data?.image || "",
      publish: data?.publish ?? true,
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const response = await fetch(
        data ? `/api/category/${data.slug}` : "/api/category",
        {
          method: data ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        }
      );

      const result = await response.json();

      if (result) {
        toast.success(result.message);
        router.back();
      } else {
        toast.error(result.message);
      }
    } catch (error: any) {
      toast.error(error.message || "Something went wrong");
    }
  };

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Title Input */}
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input placeholder="Enter category title" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Publish Dropdown */}
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

          {/* Image Upload */}
          <FormField
            control={form.control}
            name="image"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <ImageUpload
                    initialImage={field.value}
                    onUploadSuccess={(url) => field.onChange(url)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Submit Button */}
          <Button type="submit" className="w-full">
            Save
          </Button>
        </form>
      </Form>
    </div>
  );
}
