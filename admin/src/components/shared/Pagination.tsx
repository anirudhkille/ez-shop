"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface PaginationProps {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export function Pagination({ page, limit, total, totalPages }: PaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const navigate = (nextPage: number, nextLimit: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(nextPage));
    params.set("limit", String(nextLimit));
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex items-center justify-between py-4">
      <div className="text-sm text-muted-foreground">
        {total > 0
          ? `${(page - 1) * limit + 1}-${Math.min(page * limit, total)} of ${total}`
          : "0 of 0"}
      </div>
      <div className="flex items-center gap-2">
        <Select
          value={String(limit)}
          onValueChange={(value) => navigate(1, Number(value))}
        >
          <SelectTrigger className="w-[110px] h-8 text-sm">
            <SelectValue placeholder="Rows" />
          </SelectTrigger>
          <SelectContent>
            {[10, 20, 50, 100].map((size) => (
              <SelectItem key={size} value={String(size)}>
                {size} / page
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(page - 1, limit)}
          disabled={page <= 1}
        >
          <ChevronLeft />
        </Button>
        <span className="text-sm">
          Page {page} of {totalPages || 1}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(page + 1, limit)}
          disabled={page >= totalPages}
        >
          <ChevronRight />
        </Button>
      </div>
    </div>
  );
}