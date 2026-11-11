"use client";

import { DataTable } from "@/components/shared/data-table";
import { TableToolbar } from "@/components/shared/table-toolbar";

import { IOrder, IPagination } from "@/types";

import { columns } from "./order-column";

interface OrderTableProps {
  data: IOrder[];
  pagination?: IPagination;
}

export function OrderTable({ data, pagination }: OrderTableProps) {
  return (
    <DataTable
      columns={columns}
      data={data}
      pagination={pagination}
      emptyMessage="No orders found."
      toolbar={
        <TableToolbar
          searchPlaceholder="Search name, email, city or ZIP"
          filters={[
            {
              key: "orderStatus",
              label: "Order status",
              allLabel: "All statuses",
              options: [
                { label: "Processing", value: "processing" },
                { label: "Shipped", value: "shipped" },
                { label: "Delivered", value: "delivered" },
              ],
            },
            {
              key: "paymentStatus",
              label: "Payment status",
              allLabel: "All payments",
              options: [
                { label: "Pending", value: "pending" },
                { label: "Paid", value: "paid" },
                { label: "Failed", value: "failed" },
              ],
            },
          ]}
        />
      }
    />
  );
}
