import { PageHeading } from "@/components/shared/PageHeading";
import { Separator } from "@/components/ui/separator";
import DataTableDemo from "@/features/products/ProductsTable";
import React from "react";

export const metadata = {
  title: "Products | Dashboard - EZ Shop Admin",
};

export default function page() {
  return (
    <div className="space-y-5">
      <PageHeading
        title="Products"
        description="Manage products"
        href="/dashboard/products/new"
      />
      <Separator />
      <DataTableDemo />
    </div>
  );
}
