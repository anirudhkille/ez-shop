import { PageHeading } from "@/components/shared/PageHeading";
import { Separator } from "@/components/ui/separator";
import { OrderTable } from "@/features/orders/OrderTable";
import React from "react";

export const metadata = {
  title: "Orders | Dashboard - EZ Shop Admin",
};

export default async function Page() {
  const data = await fetch(`${process.env.NEXT_DOMAIN_NAME}/api/orders`, {
    cache: "no-store",
  });
  const posts = await data.json();

  return (
    <div className="space-y-5">
      <PageHeading
        title="Orders"
        description="Manage customer orders"
      />

      <Separator />
      <OrderTable data={posts.data || []} />
    </div>
  );
}
