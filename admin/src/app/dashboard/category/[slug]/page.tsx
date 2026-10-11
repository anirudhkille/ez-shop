import React from "react";

import { serverFetch } from "@/lib/server-api";

import { Separator } from "@/components/ui/separator";

import { PageHeading } from "@/components/shared/page-heading";

import CategoryForm from "@/features/category/category-form";

import { ICategory } from "@/types";

export const metadata = {
  title: "Category | Dashboard - EZ Shop Admin",
};

export default async function page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const slug = (await params).slug;
  const listRes = await serverFetch("/api/category?limit=1000", {
    cache: "no-store",
  });
  const list = await listRes.json();
  const category = (list.data || []).find(
    (item: ICategory) => item.slug === slug
  );

  return (
    <div className="space-y-5">
      <PageHeading
        title="Category"
        description="the category details below. Click save when done."
      />

      <Separator />
      <CategoryForm data={category} />
    </div>
  );
}
