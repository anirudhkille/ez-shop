import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { toast } from "sonner";

import { getWishlists, toggleWishlist } from "@/api/wishlist";

export const useWishlists = () => {
  return useQuery({
    queryFn: getWishlists,
    queryKey: ["wishlist"],
    select: (res) => res.data,
    staleTime: Infinity,
    gcTime: 1000 * 60 * 60,
  });
};

export const useToggleWishlist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: string) => toggleWishlist(productId),

    onMutate: async (productId: string) => {
      await queryClient.cancelQueries({ queryKey: ["wishlist"] });

      const prev = queryClient.getQueryData<any>(["wishlist"]);

      queryClient.setQueryData(["wishlist"], (old: any) => {
        if (!old) {
          return { products: [productId] };
        }

        const products = old.products || [];

        const exists = products.includes(productId);

        return {
          ...old,
          products: exists
            ? products.filter((id: string) => id !== productId)
            : [...products, productId],
        };
      });

      return { prev };
    },

    onError: (_err, _vars, context) => {
      if (context?.prev) {
        queryClient.setQueryData(["wishlist"], context.prev);
      }
      console.log(_err);
      toast.error("Something went wrong");
    },

    onSuccess: (res) => {
      toast.success(res.message);
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
    },
  });
};
