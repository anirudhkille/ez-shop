import { create } from "zustand";

import { persist } from "zustand/middleware";

export type GuestCartItem = {
  _id: string;
  product: {
    _id: string;
    name: string;
    image: string;
    price: number;
    discountPrice?: number;
    slug: string;
    category?: string;
  };
  quantity: number;
  size?: string;
  variantId?: string;
  priceAtPurchase?: number;
  discountPriceAtPurchase?: number;
};

type CartState = {
  cartItems: GuestCartItem[];

  addToGuestCart: (item: GuestCartItem) => void;
  removeFromGuestCart: (id: string) => void;
  updateGuestCartQty: (id: string, quantity: number) => void;
  clearFromGuestCart: (id: string) => void;
  clearCart: () => void;

  cartTotal: () => number;
  cartCount: () => number;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cartItems: [],

      addToGuestCart: (item) =>
        set((state) => {
          const existingItem = state.cartItems.find(
            (i) => i.product._id === item.product._id && i.size === item.size
          );
          if (existingItem) {
            return {
              cartItems: state.cartItems.map((i) =>
                i._id === existingItem._id
                  ? { ...i, quantity: i.quantity + item.quantity }
                  : i
              ),
            };
          }
          return {
            cartItems: [...state.cartItems, item],
          };
        }),

      removeFromGuestCart: (id) =>
        set((state) => {
          const existingItem = state.cartItems.find((i) => i._id === id);
          if (!existingItem) return state;

          if (existingItem.quantity > 1) {
            return {
              cartItems: state.cartItems.map((i) =>
                i._id === id ? { ...i, quantity: i.quantity - 1 } : i
              ),
            };
          }

          return {
            cartItems: state.cartItems.filter((i) => i._id !== id),
          };
        }),

      updateGuestCartQty: (id, quantity) =>
        set((state) => ({
          cartItems: state.cartItems.map((i) =>
            i._id === id ? { ...i, quantity } : i
          ),
        })),

      clearFromGuestCart: (id) =>
        set((state) => ({
          cartItems: state.cartItems.filter((i) => i._id !== id),
        })),

      clearCart: () => set({ cartItems: [] }),

      cartTotal: () =>
        get().cartItems.reduce(
          (total, item) =>
            total +
            (item.product.discountPrice ?? item.product.price) * item.quantity,
          0
        ),

      cartCount: () =>
        get().cartItems.reduce((count, item) => count + item.quantity, 0),
    }),
    {
      name: "cart-store",
    }
  )
);
