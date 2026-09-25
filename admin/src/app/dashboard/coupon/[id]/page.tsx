import { notFound } from "next/navigation";
import { PageHeading } from "@/components/shared/PageHeading";
import { Separator } from "@/components/ui/separator";
import CouponForm from "@/features/coupon/CouponForm";
import { serverFetch } from "@/lib/server-api";
import React from "react";

export const metadata = {
  title: "Edit Coupon | Dashboard - EZ Shop Admin",
};

export default async function page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const res = await serverFetch(`/api/coupon/${id}`, { cache: "no-store" });

  if (!res.ok) {
    notFound();
  }

  const body = await res.json();
  const coupon = body.data;

  if (!coupon) {
    notFound();
  }

  return (
    <div className="space-y-5">
      <PageHeading
        title={`Edit ${coupon.code}`}
        description="Update the discount and its rules. Click save when done."
      />

      <Separator />
      <CouponForm data={coupon} />
    </div>
  );
}
