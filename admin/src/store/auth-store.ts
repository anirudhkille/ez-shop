import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
  name: string | null;
  email: string | null;
  login: (payload: Partial<AuthState>) => void;
  logout: () => void;
}

const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      name: null,
      email: null,
      login: (payload) =>
        set((state) => ({
          name: payload.name ?? state.name,
          email: payload.email ?? state.email,
        })),
      logout: () =>
        set({
          name: null,
          email: null,
        }),
    }),
    {
      name: "auth-store",
      partialize: (state) => ({
        name: state.name,
        email: state.email,
      }),
    }
  )
);

export default useAuthStore;
