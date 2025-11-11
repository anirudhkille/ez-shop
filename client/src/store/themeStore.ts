import { create } from "zustand";

type Theme = "dark" | "light" | "system";

type ThemeState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const storageKey = "vite-ui-theme";

const getInitialTheme = (): Theme => {
  const storedTheme = localStorage.getItem(storageKey) as Theme;
  return storedTheme || "system";
};

const useThemeStore = create<ThemeState>((set) => ({
  theme: getInitialTheme(),
  setTheme: (newTheme) => {
    set({ theme: newTheme });
    localStorage.setItem(storageKey, newTheme);

    if (newTheme === "system") {
      const systemPreference = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";
      document.documentElement.className = systemPreference;
    } else {
      document.documentElement.className = newTheme;
    }
  },
}));

export default useThemeStore;
