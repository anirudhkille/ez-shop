import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { toast } from "sonner";

import { getWishlistDetails, getWishlists, toggleWishlist } from "@/api/wishlist";

import useUserStore from "@/store/userStore";

export const useWishlists = () => {
  const { token } = useUserStore();
  return useQuery({
    queryFn: getWishlists,
    queryKey: ["wishlist"],
    select: (res) => res.data,
    staleTime: Infinity,
    gcTime: 1000 * 60 * 60,
    enabled: !!token,
  });
};

export const useToggleWishlist = () => {
  const { token } = useUserStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: string) => {
      if (!token) {
        toast.error("Login to save wishlist");
        throw new Error("Not authenticated");
      }
      return toggleWishlist(productId);
    },

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

export const useWishlistDetails = () => {
  return useQuery({
    queryFn: getWishlistDetails,
    queryKey: ["wishlist", "details"],
    select: (res) => res.data,
    staleTime: Infinity,
    gcTime: 1000 * 60 * 60,
  });
};
