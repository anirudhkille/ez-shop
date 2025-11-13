import { create } from "zustand";
import { persist } from "zustand/middleware";

type UserState = {
  token?: string | null;
  name: string | null;
  email: string | null;
  setUser: (payload: Partial<UserState>) => void;
  logout: () => void;
};

const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      token: null,
      name: null,
      email: null,
      setUser: (payload) =>
        set((state) => ({
          token: payload.token ?? state.token,
          name: payload.name ?? state.name,
          email: payload.email ?? state.email,
        })),
      logout: () =>
        set({
          token: null,
          name: null,
          email: null,
        }),
    }),
    {
      name: "user-store",
      partialize: (state) => ({
        token: state.token,
        name: state.name,
        email: state.email,
      }),
    },
  ),
);

export default useUserStore;
