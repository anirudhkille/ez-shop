import { useRouter } from "next/navigation";

import { ColumnDef } from "@tanstack/react-table";

import { toast } from "sonner";

import { clientFetch } from "@/lib/client-api";
import { formatDate } from "@/lib/format-date";

import { RowActions } from "@/components/shared/row-actions";
import { selectColumn } from "@/components/shared/table-columns";

import { ICoupon } from "@/types";

const isExpired = (coupon: ICoupon) =>
  !!coupon.expiresAt && new Date(coupon.expiresAt).getTime() < Date.now();

const isExhausted = (coupon: ICoupon) =>
  coupon.maxUses != null && coupon.usedCount >= coupon.maxUses;

const couponStatus = (coupon: ICoupon) => {
  if (!coupon.active) return "Inactive";
  if (isExpired(coupon)) return "Expired";
  if (isExhausted(coupon)) return "Used up";
  return "Active";
};

export const columns: ColumnDef<ICoupon>[] = [
  selectColumn<ICoupon>(),
  {
    accessorKey: "code",
    header: "Code",
    cell: ({ row }) => (
      <span className="font-mono font-medium uppercase">
        {row.getValue("code")}
      </span>
    ),
  },
  {
    accessorKey: "type",
    header: "Discount",
    cell: ({ row }) => {
      const coupon = row.original;
      return (
        <span>
          {coupon.type === "percentage"
            ? `${coupon.value}% off`
            : `₹${coupon.value} off`}
        </span>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = couponStatus(row.original);
      return (
        <span
          className={
            status === "Active"
              ? "inline-flex items-center rounded-md border border-green-200 bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700"
              : "inline-flex items-center rounded-md border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-xs font-medium text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
          }
        >
          {status}
        </span>
      );
    },
  },
  {
    accessorKey: "usedCount",
    header: "Used",
    cell: ({ row }) => {
      const coupon = row.original;
      return (
        <span>
          {coupon.usedCount}
          {coupon.maxUses != null ? ` / ${coupon.maxUses}` : ""}
        </span>
      );
    },
  },
  {
    accessorKey: "expiresAt",
    header: "Expires",
    cell: ({ row }) => (
      <span>{formatDate(row.getValue("expiresAt") as string | undefined)}</span>
    ),
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => <CouponActions coupon={row.original} />,
  },
];

const CouponActions = ({ coupon }: { coupon: ICoupon }) => {
  const router = useRouter();

  const handleEdit = () => {
    router.push(`/dashboard/coupon/${coupon._id}`);
  };

  const handleToggle = async () => {
    const response = await clientFetch(`/api/coupon/${coupon._id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !coupon.active }),
    });

    if (response.ok) {
      toast.success(coupon.active ? "Coupon deactivated" : "Coupon activated");
      router.refresh();
    } else {
      toast.error("Failed to update coupon");
    }
  };

  const handleDelete = async () => {
    const response = await clientFetch(`/api/coupon/${coupon._id}`, {
      method: "DELETE",
    });

    if (response.ok) {
      toast.success("Coupon deleted");
      router.refresh();
    } else {
      toast.error("Failed to delete coupon");
    }
  };

  return (
    <RowActions
      actions={[
        { label: "Edit", onSelect: handleEdit },
        {
          label: coupon.active ? "Deactivate" : "Activate",
          onSelect: handleToggle,
        },
        { label: "Delete", onSelect: handleDelete },
      ]}
    />
  );
};
