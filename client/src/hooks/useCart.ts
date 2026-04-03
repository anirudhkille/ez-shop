import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { toast } from "sonner";

import {
  addToCart,
  clearCart,
  getCart,
  getCartCount,
  removeFromCart,
  updateCartQuantity,
} from "@/api/cart";

import useUserStore from "@/store/userStore";

export const useCart = () => {
  const { token } = useUserStore();
  return useQuery({
    queryKey: ["cart"],
    queryFn: getCart,
    select: (data) => data.data,
    retry: false,
    enabled: !!token,
  });
};

export const useAddToCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addToCart,

    onMutate: async (newItem) => {
      await queryClient.cancelQueries({ queryKey: ["cart"] });

      const previousCart = queryClient.getQueryData(["cart"]);

      queryClient.setQueryData(["cart"], (old: any) => {
        if (!old) return old;

        return {
          ...old,
          data: {
            ...old.data,
            products: [...old.data.products], // you can enhance this
          },
        };
      });

      return { previousCart };
    },

    onError: (err, _, context) => {
      queryClient.setQueryData(["cart"], context?.previousCart);
      toast.error("Failed to add to cart");
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },

    onSuccess: () => {
      toast.success("Added to cart");
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
    mutationFn: (id: string) => removeFromCart(id),
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

export const useGetCartCount = () => {
  const { token } = useUserStore();
  return useQuery({
    queryKey: ["cartCount"],
    queryFn: getCartCount,
    select: (data) => data.data.count,
    enabled: !!token,
  });
};
