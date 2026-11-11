"use client";

import { DataTable } from "@/components/shared/data-table";
import { TableToolbar } from "@/components/shared/table-toolbar";

import { IPagination, IProduct } from "@/types";

import { columns } from "./product-column";

interface ProductTableProps {
  data: IProduct[];
  pagination?: IPagination;
}

export function ProductTable({ data, pagination }: ProductTableProps) {
  return (
    <DataTable
      columns={columns}
      data={data}
      pagination={pagination}
      toolbar={
        <TableToolbar
          searchPlaceholder="Search product name, slug or tag"
          filters={[
            {
              key: "publish",
              label: "Published",
              allLabel: "All",
              options: [
                { label: "Published", value: "true" },
                { label: "Unpublished", value: "false" },
              ],
            },
            {
              key: "gender",
              label: "Gender",
              allLabel: "All genders",
              options: [
                { label: "Men", value: "men" },
                { label: "Women", value: "women" },
                { label: "Unisex", value: "unisex" },
              ],
            },
          ]}
        />
      }
    />
  );
}
