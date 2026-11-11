"use client";

import { DataTable } from "@/components/shared/data-table";

import { ICategory, IPagination } from "@/types";

import { columns } from "./category-column";

interface CategoryTableProps {
  data: ICategory[];
  pagination?: IPagination;
}

export default function CategoryTable({
  data,
  pagination,
}: CategoryTableProps) {
  return <DataTable columns={columns} data={data} pagination={pagination} />;
}
