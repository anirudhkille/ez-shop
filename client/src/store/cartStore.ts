import { create } from "zustand";
import { persist } from "zustand/middleware";

type CartItem = {
  id: string;
  name: string;
  price: number;
  image?: string;
  quantity: number;
};

type CartState = {
  cartItems: CartItem[];

  addToCart: (item: Omit<CartItem, "quantity">) => void;
  removeFromCart: (id: string) => void;
  clearFromCart: (id: string) => void;
  clearCart: () => void;

  cartTotal: () => number;
  cartCount: () => number;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cartItems: [],

      addToCart: (item) =>
        set((state) => {
          const existingItem = state.cartItems.find((i) => i.id === item.id);
          if (existingItem) {
            return {
              cartItems: state.cartItems.map((i) =>
                i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
              ),
            };
          }
          return {
            cartItems: [...state.cartItems, { ...item, quantity: 1 }],
          };
        }),

      removeFromCart: (id) =>
        set((state) => {
          const existingItem = state.cartItems.find((i) => i.id === id);
          if (!existingItem) return state;

          if (existingItem.quantity > 1) {
            return {
              cartItems: state.cartItems.map((i) =>
                i.id === id ? { ...i, quantity: i.quantity - 1 } : i
              ),
            };
          }

          // If quantity <= 1, remove item
          return {
            cartItems: state.cartItems.filter((i) => i.id !== id),
          };
        }),

      clearFromCart: (id) =>
        set((state) => ({
          cartItems: state.cartItems.filter((i) => i.id !== id),
        })),

      clearCart: () => set({ cartItems: [] }),

      cartTotal: () =>
        get().cartItems.reduce(
          (total, item) => total + item.price * item.quantity,
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
