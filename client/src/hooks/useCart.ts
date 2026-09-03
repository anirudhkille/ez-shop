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

import { type GuestCartItem, useCartStore } from "@/store/cartStore";
import useUserStore from "@/store/userStore";

let guestIdCounter = 0;
const nextGuestId = () => `guest_${Date.now()}_${++guestIdCounter}`;

const computeGuestCartData = (cartItems: GuestCartItem[]) => {
  const subtotal = cartItems.reduce(
    (sum, i) => sum + (i.product.price ?? 0) * i.quantity,
    0
  );
  const discountTotal = cartItems.reduce((sum, i) => {
    const discountPrice = i.product.discountPrice;
    return (
      sum +
      (discountPrice && discountPrice > 0
        ? (i.product.price - discountPrice) * i.quantity
        : 0)
    );
  }, 0);
  return {
    products: cartItems,
    subtotal,
    discountTotal,
    shipping: 0,
    total: subtotal - discountTotal,
  };
};

const syncGuestCartToCache = (
  queryClient: ReturnType<typeof useQueryClient>
) => {
  const { cartItems } = useCartStore.getState();
  const data = computeGuestCartData(cartItems);
  queryClient.setQueryData(["cart"], { data });
};

export const useCart = () => {
  const { token } = useUserStore();
  const cartItems = useCartStore((s) => s.cartItems);

  const query = useQuery({
    queryKey: ["cart"],
    queryFn: getCart,
    select: (data) => data.data,
    retry: false,
    enabled: !!token,
  });

  if (!token) {
    return {
      data: computeGuestCartData(cartItems),
      isLoading: false,
      isPending: false,
    } as typeof query;
  }

  return query;
};

export const useAddToCart = () => {
  const { token } = useUserStore();
  const addToGuestCart = useCartStore((s) => s.addToGuestCart);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: {
      productId: string;
      variantId?: string;
      size?: string;
      quantity?: number;
      name?: string;
      image?: string;
      price?: number;
      discountPrice?: number;
      slug?: string;
      category?: string;
    }) => {
      if (!token) {
        addToGuestCart({
          _id: nextGuestId(),
          product: {
            _id: payload.productId,
            name: payload.name || "",
            image: payload.image || "",
            price: payload.price || 0,
            discountPrice: payload.discountPrice,
            slug: payload.slug || "",
            category: payload.category,
          },
          quantity: payload.quantity || 1,
          size: payload.size,
          variantId: payload.variantId,
        });
        syncGuestCartToCache(queryClient);
        return Promise.resolve({ data: {} });
      }
      return addToCart(payload);
    },

    onMutate: async () => {
      if (!token) return;
      await queryClient.cancelQueries({ queryKey: ["cart"] });

      const previousCart = queryClient.getQueryData(["cart"]);

      queryClient.setQueryData(["cart"], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          data: {
            ...old.data,
            products: [...old.data.products],
          },
        };
      });

      return { previousCart };
    },

    onError: (_, __, context) => {
      if (!token) {
        toast.error("Failed to add to cart");
        return;
      }
      queryClient.setQueryData(["cart"], context?.previousCart);
      toast.error("Failed to add to cart");
    },

    onSettled: () => {
      if (token) {
        queryClient.invalidateQueries({ queryKey: ["cart"] });
      }
    },

    onSuccess: () => {
      toast.success("Added to cart");
    },
  });
};

export const useUpdateCartQty = () => {
  const { token } = useUserStore();
  const updateGuestCartQty = useCartStore((s) => s.updateGuestCartQty);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: { cartItemId: string; quantity: number }) => {
      if (!token) {
        updateGuestCartQty(payload.cartItemId, payload.quantity);
        syncGuestCartToCache(queryClient);
        return Promise.resolve({});
      }
      return updateCartQuantity(payload);
    },
    onSuccess: () => {
      if (token) {
        queryClient.invalidateQueries({ queryKey: ["cart"] });
        toast.success("Cart updated");
      }
    },
    onError: (error: any) => {
      if (token) {
        toast.error(error.response?.data?.message || "Failed to update cart");
      }
    },
  });
};

export const useRemoveCartItem = () => {
  const { token } = useUserStore();
  const clearFromGuestCart = useCartStore((s) => s.clearFromGuestCart);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => {
      if (!token) {
        clearFromGuestCart(id);
        syncGuestCartToCache(queryClient);
        return Promise.resolve({});
      }
      return removeFromCart(id);
    },
    onSuccess: () => {
      if (token) {
        queryClient.invalidateQueries({ queryKey: ["cart"] });
        toast.success("Item removed from cart");
      }
    },
    onError: (error: any) => {
      if (token) {
        toast.error(error.response?.data?.message || "Failed to remove item");
      }
    },
  });
};

export const useClearCart = () => {
  const { token } = useUserStore();
  const clearCartStore = useCartStore((s) => s.clearCart);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => {
      if (!token) {
        clearCartStore();
        syncGuestCartToCache(queryClient);
        return Promise.resolve({});
      }
      return clearCart();
    },
    onSuccess: () => {
      if (token) {
        queryClient.invalidateQueries({ queryKey: ["cart"] });
        toast.success("Cart cleared");
      }
    },
    onError: (error: any) => {
      if (token) {
        toast.error(error.response?.data?.message || "Failed to clear cart");
      }
    },
  });
};

export const useGetCartCount = () => {
  const { token } = useUserStore();
  const cartItems = useCartStore((s) => s.cartItems);

  const query = useQuery({
    queryKey: ["cartCount"],
    queryFn: getCartCount,
    select: (data) => data.data.count,
    enabled: !!token,
  });

  if (!token) {
    return {
      data: cartItems.reduce((count, item) => count + item.quantity, 0),
      isLoading: false,
      isPending: false,
    } as typeof query;
  }

  return query;
};
