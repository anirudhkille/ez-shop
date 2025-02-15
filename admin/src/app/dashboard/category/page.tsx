import { PageHeading } from "@/components/shared/PageHeading";
import { Separator } from "@/components/ui/separator";
import CategoryTable from "@/features/category/CategoryTable";
import React from "react";

export const metadata = {
  title: "Category | Dashboard - EZ Shop Admin",
};

export default async function Page() {
  const data = await fetch(`${process.env.NEXT_DOMAIN_NAME}/api/category`, {
    cache: "no-store",
  });
  const posts = await data.json();

  return (
    <div className="space-y-5">
      <PageHeading
        title="Category"
        description="Manage category"
        href="/dashboard/category/new"
      />

      <Separator />
      <CategoryTable data={posts.data || []} />
    </div>
  );
}
