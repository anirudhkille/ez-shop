import {
  addToCart,
  clearCart,
  getCart,
  removeFromCart,
  updateCartQuantity,
} from "@/api/cart";
import { toast } from "sonner";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

export const useCart = () => {
  return useQuery({
    queryKey: ["cart"],
    queryFn: getCart,
    placeholderData: keepPreviousData,
  });
};

export const useAddToCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addToCart,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      toast.success("Added to cart");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to add to cart");
    },
  });
};

export const useUpdateCartQty = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateCartQuantity,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      toast.success("Cart updated");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update cart");
    },
  });
};

export const useRemoveCartItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: removeFromCart,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      toast.success("Item removed from cart");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to remove item");
    },
  });
};

export const useClearCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: clearCart,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      toast.success("Cart cleared");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to clear cart");
    },
  });
};
