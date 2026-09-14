import { PageHeading } from "@/components/shared/PageHeading";
import { Separator } from "@/components/ui/separator";
import CategoryForm from "@/features/category/CategoryForm";
import { serverFetch } from "@/lib/server-api";
import { ICategory } from "@/types";
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
  const listRes = await serverFetch("/api/category", { cache: "no-store" });
  const list = await listRes.json();
  const category = (list.data || []).find(
    (item: ICategory) => item.slug === slug,
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
