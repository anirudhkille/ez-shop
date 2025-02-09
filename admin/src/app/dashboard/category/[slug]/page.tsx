import { PageHeading } from "@/components/shared/PageHeading";
import { Separator } from "@/components/ui/separator";
import CategoryForm from "@/features/category/CategoryForm";
import React from "react";

export const metadata = {
  title: "Category | Dashboard - EZ Shop Admin",
};

export default async function page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const slug = (await params).slug;
  const data = await fetch(
    `${process.env.NEXT_DOMAIN_NAME}/api/category/${slug}`
  );
  const posts = await data.json();

  return (
    <div className="space-y-5">
      <PageHeading
        title="Category"
        description="the category details below. Click save when done."
      />

      <Separator />
      <CategoryForm data={posts?.data} />
    </div>
  );
}
