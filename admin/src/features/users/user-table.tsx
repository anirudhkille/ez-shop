"use client";

import { DataTable } from "@/components/shared/data-table";
import { TableToolbar } from "@/components/shared/table-toolbar";

import { IPagination, IUser } from "@/types";

import { columns } from "./user-column";

interface UserTableProps {
  data: IUser[];
  pagination?: IPagination;
}

export function UserTable({ data, pagination }: UserTableProps) {
  return (
    <DataTable
      columns={columns}
      data={data}
      pagination={pagination}
      emptyMessage="No users found."
      toolbar={
        <TableToolbar
          searchPlaceholder="Search name, email or phone"
          filters={[
            {
              key: "role",
              label: "Role",
              allLabel: "All roles",
              options: [
                { label: "User", value: "User" },
                { label: "Admin", value: "Admin" },
              ],
            },
          ]}
        />
      }
    />
  );
}
