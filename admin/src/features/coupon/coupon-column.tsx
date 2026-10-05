import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ICoupon } from "@/types";
import { useRouter } from "next/navigation";
import { clientFetch } from "@/lib/client-api";
import { toast } from "sonner";

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
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
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
    cell: ({ row }) => {
      const expiresAt = row.getValue("expiresAt") as string | undefined;
      if (!expiresAt) return <span className="text-muted-foreground">—</span>;
      return (
        <span>{new Date(expiresAt).toLocaleDateString("en-IN")}</span>
      );
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => <CouponActions coupon={row.original} />,
  },
];

const CouponActions = ({ coupon }: { coupon: ICoupon }) => {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);

  const handleEdit = () => {
    setOpen(false);
    router.push(`/dashboard/coupon/${coupon._id}`);
  };

  const handleToggle = async () => {
    setOpen(false);
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
    setOpen(false);
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
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="w-8 h-8 p-0"
          onClick={(event) => event.stopPropagation()}
        >
          <span className="sr-only">Open menu</span>
          <MoreHorizontal />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem onSelect={handleEdit}>Edit</DropdownMenuItem>
        <DropdownMenuItem onSelect={handleToggle}>
          {coupon.active ? "Deactivate" : "Activate"}
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={handleDelete}>Delete</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
