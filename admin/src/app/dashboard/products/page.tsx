import { PageHeading } from "@/components/shared/PageHeading";
import { Separator } from "@/components/ui/separator";
import { ProductTable } from "@/features/products/ProductTable";
import React from "react";

export const metadata = {
  title: "Products | Dashboard - EZ Shop Admin",
};

export default async function Page() {
  const data = await fetch(`${process.env.NEXT_DOMAIN_NAME}/api/products`, {
    cache: "no-store",
  });
  const posts = await data.json();

  return (
    <div className="space-y-5">
      <PageHeading
        title="Products"
        description="Manage products"
        href="/dashboard/products/new"
      />

      <Separator />
      <ProductTable data={posts.data || []} />
    </div>
  );
}
