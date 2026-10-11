import { PageHeading } from "@/components/shared/page-heading";
import { Separator } from "@/components/ui/separator";
import { OrderTable } from "@/features/orders/order-table";
import { serverFetch } from "@/lib/server-api";
import { IPaginatedResponse, IOrder } from "@/types";
import React from "react";

export const metadata = {
  title: "Orders | Dashboard - EZ Shop Admin",
};

interface PageProps {
  searchParams: Promise<{
    page?: string;
    limit?: string;
    search?: string;
    orderStatus?: string;
    paymentStatus?: string;
  }>;
}

export default async function Page({ searchParams }: PageProps) {
  const sp = await searchParams;
  const page = Math.max(Number(sp.page) || 1, 1);
  const limit = Math.max(Number(sp.limit) || 10, 1);

  const query = new URLSearchParams({ page: String(page), limit: String(limit) });
  for (const key of ["search", "orderStatus", "paymentStatus"] as const) {
    if (sp[key]) query.set(key, sp[key]!);
  }

  const data = await serverFetch(`/api/order?${query.toString()}`, {
    cache: "no-store",
  });
  const posts: IPaginatedResponse<IOrder> = await data.json();

  return (
    <div className="space-y-5">
      <PageHeading
        title="Orders"
        description="Manage customer orders"
      />

      <Separator />
      <OrderTable data={posts.data || []} pagination={posts.pagination} />
    </div>
  );
}
