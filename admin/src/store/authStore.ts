import { create } from "zustand";

interface AuthState {
  token?: string | null;
  name: string | null;
  email: string | null;
  login: (payload: Partial<AuthState>) => void;
  logout: () => void;
}

const useAuthStore = create<AuthState>((set) => ({
  token: null,
  name: null,
  email: null,
  login: (payload) =>
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
}));

export default useAuthStore;
