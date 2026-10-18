import React from "react";

import { notFound } from "next/navigation";

import { serverFetch } from "@/lib/server-api";

import { Separator } from "@/components/ui/separator";

import { PageHeading } from "@/components/shared/page-heading";

import ProductForm from "@/features/products/product-form";

import { ApiResponse, IProduct } from "@/types";

export const metadata = {
  title: "Product | Dashboard - EZ Shop Admin",
};

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const res = await serverFetch(`/api/product/${id}`, { cache: "no-store" });

  if (!res.ok) {
    notFound();
  }

  const body: ApiResponse<IProduct> = await res.json();
  const product = body.data;

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
