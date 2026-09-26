import { notFound } from "next/navigation";
import { PageHeading } from "@/components/shared/PageHeading";
import { Separator } from "@/components/ui/separator";
import ProductForm from "@/features/products/ProductForm";
import { serverFetch } from "@/lib/server-api";
import { IPaginatedResponse, IProduct } from "@/types";
import React from "react";

export const metadata = {
  title: "Product | Dashboard - EZ Shop Admin",
};

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // The product API only exposes a public /:slug/:id read, so the single
  // product is resolved from the admin list endpoint by id — the same approach
  // the category detail page uses.
  const res = await serverFetch("/api/product?limit=1000", { cache: "no-store" });

  if (!res.ok) {
    notFound();
  }

  const body: IPaginatedResponse<IProduct> = await res.json();
  const product = (body.data || []).find((item) => item._id === id);

  if (!product) {
    notFound();
  }

  return (
    <div className="space-y-5">
      <PageHeading
        title={product.name}
        description="Review the product details below. Click save when done."
      />

      <Separator />
      <ProductForm data={product} />
    </div>
  );
}
