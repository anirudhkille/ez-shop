import { PageHeading } from "@/components/shared/PageHeading";
import { Separator } from "@/components/ui/separator";
import OrderDetail from "@/features/orders/OrderDetail";
import React from "react";

export const metadata = {
  title: "Order Details | Dashboard - EZ Shop Admin",
};

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const id = (await params).id;
  const data = await fetch(
    `${process.env.NEXT_DOMAIN_NAME}/api/orders/${id}`,
    { cache: "no-store" }
  );
  const post = await data.json();

  if (!post.success) {
    return <div>Order not found</div>;
  }

  return (
    <div className="space-y-5">
      <PageHeading
        title={`Order #${post.data._id.slice(-8)}`}
        description="View and manage order details"
      />

      <Separator />
      <OrderDetail order={post.data} />
    </div>
  );
}
