import {
  addToWishlist,
  getWishlists,
  removeFromWishlist,
} from "@/api/wishlist";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";

export const useWishlists = () => {
  return useQuery({
    queryFn: getWishlists,
    queryKey: ["wishlist"],
    placeholderData: keepPreviousData,
  });
};

export const useAddToWishlist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: string) => addToWishlist(productId),
    onSuccess: () => {
      toast.success("Added to wishlist");
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
    },
    onError: (error: any) => {
      toast.error(
        error.response.data.message || "An error occurred while adding wishlist"
      );
    },
  });
};

export const useRemoveFromWishlist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: string) => removeFromWishlist(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
      toast.success("Remove from wishlist");
    },
    onError: (error: any) => {
      console.error("remove failed", error);
    },
  });
};
