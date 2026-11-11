"use client";

import { useRouter } from "next/navigation";

import { ColumnDef } from "@tanstack/react-table";

import { toast } from "sonner";

import { ArrowUpDown } from "lucide-react";

import { clientFetch } from "@/lib/client-api";
import { formatDate } from "@/lib/format-date";

import { RowActions } from "@/components/shared/row-actions";
import { selectColumn } from "@/components/shared/table-columns";
import { Button } from "@/components/ui/button";

import { IOrder } from "@/types";

export const columns: ColumnDef<IOrder>[] = [
  selectColumn<IOrder>(),
  {
    accessorKey: "name",
    header: "Customer",
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("name")}</div>
    ),
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "totalAmount",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Total
        <ArrowUpDown />
      </Button>
    ),
    cell: ({ row }) => {
      const amount = row.getValue("totalAmount") as number;
      return <div>₹{amount?.toFixed(2)}</div>;
    },
  },
  {
    accessorKey: "paymentStatus",
    header: "Payment",
    cell: ({ row }) => {
      const status = row.getValue("paymentStatus") as string;
      return (
        <div
          className={`capitalize ${
            status === "paid"
              ? "text-green-600"
              : status === "failed"
                ? "text-red-600"
                : "text-yellow-600"
          }`}
        >
          {status}
        </div>
      );
    },
  },
  {
    accessorKey: "orderStatus",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Status
        <ArrowUpDown />
      </Button>
    ),
    cell: ({ row }) => {
      const status = row.getValue("orderStatus") as string;
      return (
        <div
          className={`capitalize ${
            status === "delivered"
              ? "text-green-600"
              : status === "shipped"
                ? "text-blue-600"
                : "text-yellow-600"
          }`}
        >
          {status}
        </div>
      );
    },
  },
  {
    accessorKey: "paymentType",
    header: "Type",
    cell: ({ row }) => (
      <div className="uppercase">{row.getValue("paymentType") as string}</div>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Date",
    cell: ({ row }) => (
      <div>{formatDate(row.getValue("createdAt") as string)}</div>
    ),
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const order = row.original;
      return <OrderActions order={order} />;
    },
  },
];

const OrderActions = ({ order }: { order: IOrder }) => {
  const router = useRouter();

  const handleView = () => {
    router.push(`/dashboard/orders/${order._id}`);
  };

  const handleDelete = async () => {
    const response = await clientFetch(`/api/order/${order._id}`, {
      method: "DELETE",
    });
    if (response.ok) {
      toast.success("Order deleted");
      router.refresh();
    } else {
      toast.error("Failed to delete order");
    }
  };

  return (
    <RowActions
      actions={[
        { label: "View", onSelect: handleView },
        { label: "Delete", onSelect: handleDelete },
      ]}
    />
  );
};
