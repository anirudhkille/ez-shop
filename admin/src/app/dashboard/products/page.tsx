import { PageHeading } from "@/components/shared/PageHeading";
import { Separator } from "@/components/ui/separator";
import { ProductTable } from "@/features/products/ProductTable";
import { serverFetch } from "@/lib/server-api";
import { IPaginatedResponse, IProduct } from "@/types";
import React from "react";

export const metadata = {
  title: "Products | Dashboard - EZ Shop Admin",
};

interface PageProps {
  searchParams: Promise<{ page?: string; limit?: string }>;
}

export default async function Page({ searchParams }: PageProps) {
  const sp = await searchParams;
  const page = Math.max(Number(sp.page) || 1, 1);
  const limit = Math.max(Number(sp.limit) || 10, 1);

  const data = await serverFetch(`/api/product?page=${page}&limit=${limit}`, {
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
