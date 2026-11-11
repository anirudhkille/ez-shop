"use client";

import { DataTable } from "@/components/shared/data-table";

import { INewsletterSubscriber, IPagination } from "@/types";

import { columns } from "./subscriber-column";

interface SubscriberTableProps {
  data: INewsletterSubscriber[];
  pagination?: IPagination;
}

export default function SubscriberTable({
  data,
  pagination,
}: SubscriberTableProps) {
  return (
    <DataTable
      columns={columns}
      data={data}
      pagination={pagination}
      emptyMessage="No subscribers yet."
    />
  );
}
