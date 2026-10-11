import React from "react";

import { serverFetch } from "@/lib/server-api";

import { Separator } from "@/components/ui/separator";

import { PageHeading } from "@/components/shared/page-heading";

import { ProductTable } from "@/features/products/product-table";

import { IPaginatedResponse, IProduct } from "@/types";

export const metadata = {
  title: "Products | Dashboard - EZ Shop Admin",
};

interface PageProps {
  searchParams: Promise<{
    page?: string;
    limit?: string;
    search?: string;
    publish?: string;
    gender?: string;
  }>;
}

export default async function Page({ searchParams }: PageProps) {
  const sp = await searchParams;
  const page = Math.max(Number(sp.page) || 1, 1);
  const limit = Math.max(Number(sp.limit) || 10, 1);

  const query = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  for (const key of ["search", "publish", "gender"] as const) {
    if (sp[key]) query.set(key, sp[key]!);
  }

  const data = await serverFetch(`/api/product?${query.toString()}`, {
    cache: "no-store",
  });
  const posts: IPaginatedResponse<IProduct> = await data.json();

  return (
    <div className="space-y-5">
      <PageHeading
        title="Products"
        description="Manage products"
        href="/dashboard/products/new"
      />

      <Separator />
      <ProductTable data={posts.data || []} pagination={posts.pagination} />
    </div>
  );
}
