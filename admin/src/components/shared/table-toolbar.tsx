"use client";

import * as React from "react";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type FilterOption = { label: string; value: string };

type Props = {
  searchPlaceholder: string;
  filters?: {
    key: string;
    label: string;
    options: FilterOption[];
    allLabel: string;
  }[];
};

/**
 * Search and filters write to the URL rather than local state, so the server
 * component page re-queries with them and the view survives a refresh or a
 * shared link.
 */
export function TableToolbar({ searchPlaceholder, filters = [] }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const search = searchParams.get("search") ?? "";

  // Any filter change invalidates the current page number.
  const apply = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("page");

    if (value) params.set(key, value);
    else params.delete(key);

    router.push(`${pathname}?${params.toString()}`);
  };

  const [term, setTerm] = React.useState(search);

  React.useEffect(() => {
    setTerm(search);
  }, [search]);

  React.useEffect(() => {
    if (term === search) return;

    const timer = setTimeout(() => apply("search", term), 350);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [term]);

  const active =
    Boolean(search) || filters.some((f) => searchParams.get(f.key));

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative min-w-[220px] flex-1">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={term}
          onChange={(event) => setTerm(event.target.value)}
          placeholder={searchPlaceholder}
          aria-label={searchPlaceholder}
          className="pl-9"
        />
      </div>

      {filters.map((filter) => (
        <Select
          key={filter.key}
          value={searchParams.get(filter.key) ?? "all"}
          onValueChange={(value) =>
            apply(filter.key, value === "all" ? "" : value)
          }
        >
          <SelectTrigger aria-label={filter.label} className="w-[170px]">
            <SelectValue placeholder={filter.label} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{filter.allLabel}</SelectItem>
            {filter.options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ))}

      {active && (
        <Button
          variant="ghost"
          onClick={() => {
            const params = new URLSearchParams();
            const limit = searchParams.get("limit");
            if (limit) params.set("limit", limit);
            router.push(`${pathname}${params.toString() ? `?${params}` : ""}`);
          }}
        >
          <X className="size-4" />
          Clear
        </Button>
      )}
    </div>
  );
}
