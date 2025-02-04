import { create } from "zustand";
import { persist } from "zustand/middleware";

const useCartStore = create()(
  persist((set, get) => ({
    cartItems: [],
    addToCart: (payload) =>
      set((state) => {
        const itemExists = state.cartItems.find(
          (item) => item.id === payload.id
        );
        if (itemExists) {
          return {
            cartItems: state.cartItems.map((item) =>
              item.id === payload.id
                ? {
                    ...item,
                    quantity: item.quantity + 1,
                  }
                : item
            ),
          };
        }
        return { cartItems: [...state.cartItems, { ...payload, quantity: 1 }] };
      }),
    removeFromCart: (id) =>
      set((state) => {
        const itemExists = state.cartItems.find((item) => item.id === id);
        if (itemExists && itemExists.quantity > 1) {
          return {
            cartItems: state.cartItems.map((item) =>
              item.id === id
                ? {
                    ...item,
                    quantity: item.quantity - 1,
                  }
                : item
            ),
          };
        }
        return { cartItems: state.cartItems.filter((item) => item.id !== id) };
      }),
    clearFromCart: (id) => {
      set((state) => ({
        cartItems: state.cartItems.filter((item) => item.id !== id),
      }));
      console.log(id)
    },
    clearCart: () => set({ cartItems: [] }),
    cartTotal: () =>
      get().cartItems.reduce(
        (total, item) => total + item.price * item.quantity,
        0
      ),
  }))
);

export default useCartStore;
