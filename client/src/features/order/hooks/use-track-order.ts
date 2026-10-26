import { useEffect, useState } from "react";

import { useSearchParams } from "react-router";

import { useOrderById } from "./use-order";

export const useTrackOrder = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const paramId = searchParams.get("orderId")?.trim() ?? "";
  const [searchedId, setSearchedId] = useState(paramId);

  useEffect(() => {
    setSearchedId(paramId);
  }, [paramId]);

  const { data, isLoading, isError } = useOrderById(searchedId);

  const search = (id: string) => {
    const trimmed = id.trim();

    setSearchedId(trimmed);
    setSearchParams(trimmed ? { orderId: trimmed } : {}, { replace: true });
  };

  return {
    order: data?.data,
    isLoading,
    isError,
    searchedId,
    search,
  };
};
