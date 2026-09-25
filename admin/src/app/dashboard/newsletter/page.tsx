import { PageHeading } from "@/components/shared/PageHeading";
import { Separator } from "@/components/ui/separator";
import SubscriberTable from "@/features/newsletter/SubscriberTable";
import { serverFetch } from "@/lib/server-api";
import { IPaginatedResponse, INewsletterSubscriber } from "@/types";
import React from "react";

export const metadata = {
  title: "Newsletter | Dashboard - EZ Shop Admin",
};

interface PageProps {
  searchParams: Promise<{ page?: string; limit?: string }>;
}

export default async function Page({ searchParams }: PageProps) {
  const sp = await searchParams;
  const page = Math.max(Number(sp.page) || 1, 1);
  const limit = Math.max(Number(sp.limit) || 10, 1);

  const data = await serverFetch(`/api/newsletter?page=${page}&limit=${limit}`, {
    cache: "no-store",
  });

  if (!data.ok) {
    return <div>Could not load subscribers</div>;
  }

  const subscribers: IPaginatedResponse<INewsletterSubscriber> =
    await data.json();

  return (
    <div className="space-y-5">
      <PageHeading
        title="Newsletter"
        description="People who signed up for marketing emails"
      />

      <Separator />
      <SubscriberTable
        data={subscribers.data || []}
        pagination={subscribers.pagination}
      />
    </div>
  );
}
