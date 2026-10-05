import js from "@eslint/js";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import { defineConfig, globalIgnores } from "eslint/config";
import globals from "globals";
import tseslint from "typescript-eslint";

const boundaryRules = {
  "no-restricted-imports": [
    "error",
    {
      patterns: [
        {
          group: ["@/features/*/*"],
          message:
            "Import a feature's public API from '@/features/<name>', not its internals.",
        },
        {
          group: ["@/shared/types/*"],
          message:
            "Domain types live with their feature. Transport types belong in '@/shared/lib'.",
        },
      ],
    },
  ],
};

export default defineConfig([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs["recommended-latest"].rules,
      ...reactRefresh.configs.vite.rules,
      ...boundaryRules,
    },
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
  },
  {
    files: ["src/app/routes.tsx"],
    rules: { "no-restricted-imports": "off" },
  },
]);
