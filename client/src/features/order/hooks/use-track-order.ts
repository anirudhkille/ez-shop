import { useState } from "react";

import { useOrderById } from "./use-order";

export const useTrackOrder = () => {
  const [searchedId, setSearchedId] = useState("");

  const { data, isLoading, isError } = useOrderById(searchedId);

  return {
    order: data?.data,
    isLoading,
    isError,
    search: (id: string) => setSearchedId(id.trim()),
  };
};
