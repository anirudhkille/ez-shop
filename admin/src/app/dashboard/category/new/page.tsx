import React from "react";

import { Separator } from "@/components/ui/separator";

import { PageHeading } from "@/components/shared/page-heading";

import CategoryForm from "@/features/category/category-form";

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
