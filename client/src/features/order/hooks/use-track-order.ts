import { useState } from "react";

import { useOrderById } from "./useOrder";

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
