import { PageHeading } from "@/components/shared/page-heading";
import { Separator } from "@/components/ui/separator";
import CouponForm from "@/features/coupon/coupon-form";
import React from "react";

export const metadata = {
  title: "New Coupon | Dashboard - EZ Shop Admin",
};

export default function page() {
  return (
    <div className="space-y-5">
      <PageHeading
        title="New Coupon"
        description="Set the discount and its rules. Click save when done."
      />

      <Separator />
      <CouponForm />
    </div>
  );
}
