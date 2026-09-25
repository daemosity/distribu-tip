import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import { defineConfig } from "eslint/config";

export default defineConfig([
    {
        plugins: { js },
        languageOptions: {
            globals: {
                ...globals.jest,
            },
        },
        files: ["**/*.{js,mjs,cjs,ts,mts,cts}"],
        extends: ["js/recommended"],
        ignores: ["node_modules/**/*", "package-lock.json"],
    },
    tseslint.configs.recommended,
    {
        basePath: "src/core",
        rules: {
            "no-restricted-globals": [
                "error",
                {
                    globals: Object.keys(globals.browser)
                        .filter((global) => global !== "console")
                        .map((global) => ({
                            name: global,
                            message: "Use of global object is not allowed",
                        })),
                },
            ],
            "no-restricted-imports": [
                "error",
                {
                    patterns: [
                        {
                            group: [
                                "!(src/core/**/*)",
                                "!(@/core/**/*)",
                                "react*",
                                "expo*",
                                "drizzle*",
                            ],
                            message:
                                "Core may not import external directories or libraries",
                        },
                    ],
                },
            ],
        },
    },
]);
