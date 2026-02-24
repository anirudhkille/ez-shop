import { getCategorys } from "@/api/category";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

export const useCategorys = () => {
  return useQuery({
    queryFn: getCategorys,
    queryKey: ["category"],
    placeholderData: keepPreviousData,
  });
};
