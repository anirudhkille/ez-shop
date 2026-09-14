import { PageHeading } from "@/components/shared/PageHeading";
import { Separator } from "@/components/ui/separator";
import UserDetail from "@/features/users/UserDetail";
import { serverFetch } from "@/lib/server-api";
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
  const data = await serverFetch(`/api/user/${id}`, { cache: "no-store" });
  const post = await data.json();

  if (!post.success) {
    return <div>User not found</div>;
  }

  return (
    <div className="space-y-5">
      <PageHeading
        title={post.data.name || "User Details"}
        description="View user information"
      />

      <Separator />
      <UserDetail user={post.data} />
    </div>
  );
}
