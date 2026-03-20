import { useState } from "react";

import { useNavigate, useSearchParams } from "react-router";

import { ChevronDown, Settings2 } from "lucide-react";

import type { TProduct } from "@/types/product";

import { useFilteredProducts } from "@/hooks/useProduct";

import FilterSidebar from "@/features/product/filter-sidebar";
import ProductCard from "@/features/product/product-card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const SORT_OPTIONS = [
  { label: "Featured", value: "featured" },
  { label: "Newest", value: "newest" },
  { label: "Price: High to Low", value: "price-high" },
  { label: "Price: Low to High", value: "price-low" },
];

export default function Products() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const sortBy = searchParams.get("sortBy") || "newest";

  const [showFilters, setShowFilters] = useState(true);

  /* ------------------ URL FILTERS ------------------ */
  const filters = {
    sort: sortBy,
    gender: searchParams.get("gender") || "",
    category: searchParams.get("category") || "",
    type: searchParams.get("type") || "",
    size: searchParams.get("size") || "",
    color: searchParams.get("color") || "",
    price: searchParams.get("price") || "",
    page: Number(searchParams.get("page") || 1),
    limit: 20,
  };

  const { data, isLoading } = useFilteredProducts(filters);

  const handleSortBy = (value: string) => {
    const params = new URLSearchParams(location.search);
    params.set("sortBy", value);
    params.set("page", "1");
    navigate("?" + params.toString());
  };

  return (
    <div className="flex h-screen bg-white">
      {showFilters && <FilterSidebar />}

      <div className="flex-1 overflow-auto">
        <div className="sticky top-0 z-10 border-b border-gray-200 bg-white px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-gray-900">
              All Products{" "}
              <span className="text-gray-500">
                ({data?.pagination?.total || 0})
              </span>
            </h1>

            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 text-gray-700 hover:text-gray-900"
              >
                <Settings2 size={18} />
                <span>{showFilters ? "Hide Filters" : "Show Filters"}</span>
              </button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 text-gray-700 hover:text-gray-900">
                    <span>Sort By</span>
                    <ChevronDown size={18} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {SORT_OPTIONS.map((option) => (
                    <DropdownMenuItem
                      key={option.value}
                      onClick={() => handleSortBy(option.value)}
                      className={sortBy === option.value ? "bg-gray-100" : ""}
                    >
                      {option.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        <div className="p-6">
          {isLoading ? (
            <p>Loading...</p>
          ) : (
            <div className="grid auto-rows-max grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {data?.data?.map((product: TProduct) => (
                <ProductCard key={product?._id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
