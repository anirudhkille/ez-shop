import { PageHeading } from "@/components/shared/PageHeading";
import { Separator } from "@/components/ui/separator";
import UserDetail from "@/features/users/UserDetail";
import { serverFetch } from "@/lib/server-api";
import { IUserAdminDetail } from "@/types";
import React from "react";

export const metadata = {
  title: "User Details | Dashboard - EZ Shop Admin",
};

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const id = (await params).id;
  const data = await serverFetch(`/api/user/${id}/dashboard`, {
    cache: "no-store",
  });

  if (!data.ok) {
    return <div>User not found</div>;
  }

  const body = await data.json();
  const detail = body.data as IUserAdminDetail | undefined;

  if (!detail?.user) {
    return <div>User not found</div>;
  }

  return (
    <div className="space-y-5">
      <PageHeading
        title={detail.user.name || detail.user.email || "User Details"}
        description="Customer overview, orders, wishlist and addresses"
      />

      <Separator />
      <UserDetail detail={detail} />
    </div>
  );
}
