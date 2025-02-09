import { PageHeading } from "@/components/shared/PageHeading";
import { Separator } from "@/components/ui/separator";
import CategoryForm from "@/features/category/CategoryForm";
import React from "react";

export const metadata = {
  title: "Category | Dashboard - EZ Shop Admin",
};

export default function page() {
  return (
    <div className="space-y-5">
      <PageHeading
        title="Category"
        description="the category details below. Click save when done."
      />

      <Separator />
      <CategoryForm />
    </div>
  );
}
