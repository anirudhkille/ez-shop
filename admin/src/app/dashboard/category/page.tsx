import { PageHeading } from "@/components/shared/PageHeading";
import { Separator } from "@/components/ui/separator";
import CategoryTable from "@/features/category/CategoryTable";
import { serverFetch } from "@/lib/server-api";
import { IPaginatedResponse, ICategory } from "@/types";
import React from "react";

export const metadata = {
  title: "Category | Dashboard - EZ Shop Admin",
};

interface PageProps {
  searchParams: Promise<{ page?: string; limit?: string }>;
}

export default async function Page({ searchParams }: PageProps) {
  const sp = await searchParams;
  const page = Math.max(Number(sp.page) || 1, 1);
  const limit = Math.max(Number(sp.limit) || 10, 1);

  const data = await serverFetch(`/api/category?page=${page}&limit=${limit}`, {
    cache: "no-store",
  });
  const posts: IPaginatedResponse<ICategory> = await data.json();

  return (
    <div className="space-y-5">
      <PageHeading
        title="Category"
        description="Manage category"
        href="/dashboard/category/new"
      />

      <Separator />
      <CategoryTable data={posts.data || []} pagination={posts.pagination} />
    </div>
  );
}
