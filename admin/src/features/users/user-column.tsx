"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

import { ColumnDef } from "@tanstack/react-table";

import { toast } from "sonner";

import { clientFetch } from "@/lib/client-api";
import { formatDate } from "@/lib/format-date";

import { RowActions } from "@/components/shared/row-actions";
import { selectColumn } from "@/components/shared/table-columns";

import { IUser } from "@/types";

export const columns: ColumnDef<IUser>[] = [
  selectColumn<IUser>(),
  {
    accessorKey: "avatar",
    header: "Avatar",
    cell: ({ row }) => {
      const avatar = row.getValue("avatar") as string | undefined;
      return avatar ? (
        <Image
          height={40}
          width={40}
          src={avatar}
          alt="Avatar"
          className="h-10 w-10 rounded-full object-cover"
        />
      ) : (
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
          <span className="text-sm font-medium text-muted-foreground">
            {(row.original.name || row.original.email)?.[0]?.toUpperCase()}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("name") || "—"}</div>
    ),
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "phone",
    header: "Phone",
    cell: ({ row }) => <div>{row.getValue("phone") || "—"}</div>,
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("role") as string}</div>
    ),
  },
  {
    accessorKey: "isEmailVerified",
    header: "Verified",
    cell: ({ row }) => (
      <div>
        {row.getValue("isEmailVerified") ? (
          <span className="text-green-600">Yes</span>
        ) : (
          <span className="text-yellow-600">No</span>
        )}
      </div>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Joined",
    cell: ({ row }) => (
      <div>{formatDate(row.getValue("createdAt") as string)}</div>
    ),
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const user = row.original;
      return <UserActions user={user} />;
    },
  },
];

const UserActions = ({ user }: { user: IUser }) => {
  const router = useRouter();

  const handleView = () => {
    router.push(`/dashboard/users/${user._id}`);
  };

  const handleDelete = async () => {
    const response = await clientFetch(`/api/user/${user._id}`, {
      method: "DELETE",
    });
    if (response.ok) {
      toast.success("User deleted");
      router.refresh();
    } else {
      toast.error("Failed to delete user");
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
