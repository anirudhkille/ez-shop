import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { getCategorys } from "@/api/category";

export const useCategorys = () => {
  return useQuery({
    queryFn: getCategorys,
    queryKey: ["category"],
    placeholderData: keepPreviousData,
    select: (res) => res.data,
  });
};
