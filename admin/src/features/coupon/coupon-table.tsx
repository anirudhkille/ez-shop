"use client";

import { DataTable } from "@/components/shared/data-table";

import { ICoupon, IPagination } from "@/types";

import { columns } from "./coupon-column";

interface CouponTableProps {
  data: ICoupon[];
  pagination?: IPagination;
}

export default function CouponTable({ data, pagination }: CouponTableProps) {
  return <DataTable columns={columns} data={data} pagination={pagination} />;
}
