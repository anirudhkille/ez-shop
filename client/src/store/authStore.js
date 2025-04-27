import { create } from "zustand";
import { persist } from "zustand/middleware";

const useUserStore = create(
  persist(
    (set) => ({
      userDetails: [],
      login: (userDetails) => set({ userDetails }),
      logout: () => set({ userDetails: [] }),
    }),
    {
      name: "user-storage",
      partialize: (state) => ({ userDetails: state.userDetails }),
    }
  )
);

export default useUserStore;
