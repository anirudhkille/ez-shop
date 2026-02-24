import { PageHeading } from "@/components/shared/PageHeading";
import { Separator } from "@/components/ui/separator";
import ProductForm from "@/features/products/ProductForm";
import React from "react";

export const metadata = {
  title: "Product | Dashboard - EZ Shop Admin",
};

export default function page() {
  return (
    <div className="space-y-5">
      <PageHeading
        title="Product"
        description="the product details below. Click save when done."
      />

      <Separator />
      <ProductForm />
    </div>
  );
}
