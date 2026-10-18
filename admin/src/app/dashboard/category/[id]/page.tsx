import React from "react";

import { notFound } from "next/navigation";

import { serverFetch } from "@/lib/server-api";

import { Separator } from "@/components/ui/separator";

import { PageHeading } from "@/components/shared/page-heading";

import CategoryForm from "@/features/category/category-form";

import { ApiResponse, ICategory } from "@/types";

export const metadata = {
  title: "Category | Dashboard - EZ Shop Admin",
};

export default async function page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const id = (await params).id;
  const res = await serverFetch(`/api/category/${id}`, { cache: "no-store" });

  if (!res.ok) {
    notFound();
  }

  const body: ApiResponse<ICategory> = await res.json();
  const category = body.data;

  if (!category) {
    notFound();
  }

  return (
    <div className="space-y-5">
      <PageHeading
        title="Category"
        description="Review the category details below. Click save when done."
      />

      <Separator />
      <CategoryForm data={category} />
    </div>
  );
}
