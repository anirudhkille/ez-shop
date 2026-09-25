import { PageHeading } from "@/components/shared/PageHeading";
import { Separator } from "@/components/ui/separator";
import CouponTable from "@/features/coupon/CouponTable";
import { serverFetch } from "@/lib/server-api";
import { IPaginatedResponse, ICoupon } from "@/types";
import React from "react";

export const metadata = {
  title: "Coupons | Dashboard - EZ Shop Admin",
};

interface PageProps {
  searchParams: Promise<{ page?: string; limit?: string }>;
}

export default async function Page({ searchParams }: PageProps) {
  const sp = await searchParams;
  const page = Math.max(Number(sp.page) || 1, 1);
  const limit = Math.max(Number(sp.limit) || 10, 1);

  const data = await serverFetch(`/api/coupon?page=${page}&limit=${limit}`, {
    cache: "no-store",
  });
  const coupons: IPaginatedResponse<ICoupon> = await data.json();

  return (
    <div className="space-y-5">
      <PageHeading
        title="Coupons"
        description="Create and manage discount codes"
        href="/dashboard/coupon/new"
      />

      <Separator />
      <CouponTable
        data={coupons.data || []}
        pagination={coupons.pagination}
      />
    </div>
  );
}
