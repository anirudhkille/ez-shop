import { PageHeading } from "@/components/shared/PageHeading";
import { Separator } from "@/components/ui/separator";
import { OrderTable } from "@/features/orders/OrderTable";
import { serverFetch } from "@/lib/server-api";
import { IPaginatedResponse, IOrder } from "@/types";
import React from "react";

export const metadata = {
  title: "Orders | Dashboard - EZ Shop Admin",
};

interface PageProps {
  searchParams: Promise<{ page?: string; limit?: string }>;
}

export default async function Page({ searchParams }: PageProps) {
  const sp = await searchParams;
  const page = Math.max(Number(sp.page) || 1, 1);
  const limit = Math.max(Number(sp.limit) || 10, 1);

  const data = await serverFetch(`/api/order?page=${page}&limit=${limit}`, {
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
