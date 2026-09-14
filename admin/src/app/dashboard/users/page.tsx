import { PageHeading } from "@/components/shared/PageHeading";
import { Separator } from "@/components/ui/separator";
import { UserTable } from "@/features/users/UserTable";
import { serverFetch } from "@/lib/server-api";
import React from "react";

export const metadata = {
  title: "Users | Dashboard - EZ Shop Admin",
};

export default async function Page() {
  const data = await serverFetch("/api/user", { cache: "no-store" });
  const posts = await data.json();

  return (
    <div className="space-y-5">
      <PageHeading
        title="Users"
        description="Manage registered users"
      />

      <Separator />
      <UserTable data={posts.data || []} />
    </div>
  );
}
