import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    plugins: { js },
    files: ["**/*.{js,mjs,cjs,ts,mts,cts}"],
    extends: ["js/recommended"],
    languageOptions: {
      globals: globals.browser,
    },
  },
  tseslint.configs.recommended,
  {
    files: ["./src/core/**"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: ["react", "react-native", "expo*", "drizzle-orm", "*../*"],
        },
      ],
    },
  },
]);
