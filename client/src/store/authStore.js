import { create, useStore } from "zustand";

const store = useStore((set) => ({
  token: null,
}));
