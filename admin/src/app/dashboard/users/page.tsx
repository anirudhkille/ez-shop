import { PageHeading } from "@/components/shared/PageHeading";
import { Separator } from "@/components/ui/separator";
import { UserTable } from "@/features/users/UserTable";
import { serverFetch } from "@/lib/server-api";
import { IPaginatedResponse, IUser } from "@/types";
import React from "react";

export const metadata = {
  title: "Users | Dashboard - EZ Shop Admin",
};

interface PageProps {
  searchParams: Promise<{ page?: string; limit?: string }>;
}

export default async function Page({ searchParams }: PageProps) {
  const sp = await searchParams;
  const page = Math.max(Number(sp.page) || 1, 1);
  const limit = Math.max(Number(sp.limit) || 10, 1);

  const data = await serverFetch(`/api/user?page=${page}&limit=${limit}`, {
    cache: "no-store",
  });
  const posts: IPaginatedResponse<IUser> = await data.json();

  return (
    <div className="space-y-5">
      <PageHeading
        title="Users"
        description="Manage registered users"
      />

      <Separator />
      <UserTable data={posts.data || []} pagination={posts.pagination} />
    </div>
  );
}
